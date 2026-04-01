# IP Anonymization + Geolocation — Design Spec

**Issue:** qrky-kao  
**Date:** 2026-04-01  
**Status:** Approved

---

## Problem

QRky stores raw IP addresses in the `visits` table on every redirect and QR scan. As a privacy-focused product, raw IPs must not be persisted. The IP is only needed in-flight for geolocation purposes. What gets stored should be an anonymized hash that enables future abuse detection and collision analysis without revealing the original address.

---

## Goals

- Never persist a raw IP address
- Store an HMAC-SHA256 hash of the IP instead
- Resolve country (ISO 3166-1 alpha-2) and region (ISO 3166-2 subdivision) from the IP before discarding it
- Use MaxMind GeoLite2-City for geolocation
- Degrade gracefully when geo data is unavailable (store `"UNKNOWN"`)

---

## Out of Scope

- Automated GeoLite2 database updates (noted as future work — `.mmdb` file can be replaced on disk without a redeploy)
- Backfilling existing `visits` rows (existing data is test data; no migration needed)

---

## Data Flow

```
Request headers
    → enrichVisit(headers)
        → extract raw IP (x-forwarded-for || x-real-ip || "")
        → HMAC-SHA256(ip, HMAC_SECRET) → ipHash
        → GeoLite2 lookup(ip) → { country, region } || "UNKNOWN"
    → record_view RPC({ ip_hash, country, region, useragent, ... })
        → INSERT INTO visits
```

The raw IP never leaves `enrichVisit`. It is used in-flight only and immediately discarded.

---

## Database Changes

### Migration 1 — visits table schema

- Rename column `ip` → `ip_hash`
- Add column `country text` (ISO 3166-1 alpha-2 code, e.g. `"ZA"`, or `"UNKNOWN"`)
- Add column `region text` (ISO 3166-2 subdivision code, e.g. `"ZA-WC"`, or `"UNKNOWN"`)

Existing rows are not backfilled. A comment in the migration records that pre-migration values in `ip_hash` are raw IPs from test data.

### Migration 2 — record_view function

Update the `record_view` Postgres function:

- Replace parameter `ip text` with `ip_hash text`
- Add parameters `country text` and `region text`
- Update the `INSERT INTO visits` statement to use the new column names and parameters

---

## Application Changes

### New file: `src/lib/enrich-visit.ts`

Responsibilities:
- Accept `ReadonlyHeaders`
- Extract raw IP from `x-forwarded-for` header (use the first IP if the header contains a comma-separated list), falling back to `x-real-ip`, then `""`
- Compute HMAC-SHA256 of the IP using Node's built-in `crypto` module (no new dependency) with the `HMAC_SECRET` env var as the key
- Look up country and region via `@maxmind/geoip2-node`, reading from the file at `GEOIP_DB_PATH`
- Return `{ ipHash: string, country: string, region: string }`

The GeoLite2 reader must be initialised once at module load as a singleton (not per-call) to avoid re-reading the `.mmdb` file on every request. If initialisation fails, the singleton is `null` and all lookups degrade to `"UNKNOWN"`.

Failure handling:
- If `GEOIP_DB_PATH` is not set, missing, or unreadable: `country` and `region` return `"UNKNOWN"`
- If the IP is not found in the database: `country` and `region` return `"UNKNOWN"`
- If the `.mmdb` file is corrupt or the reader throws: `country` and `region` return `"UNKNOWN"`
- Hashing always succeeds (empty string IP produces a valid hash)

### Updated: `src/lib/record-view.ts`

- Call `enrichVisit(headers)` to get `{ ipHash, country, region }`
- Pass `ip_hash`, `country`, `region` to the `record_view` RPC
- Remove direct IP extraction logic (now owned by `enrich-visit.ts`)

### New environment variables

| Variable | Description | Required |
|---|---|---|
| `HMAC_SECRET` | Secret key for HMAC-SHA256 IP hashing | Yes — hashing fails without it |
| `GEOIP_DB_PATH` | Absolute path to GeoLite2-City `.mmdb` file | Required for geo data; if missing, country/region degrade to `"UNKNOWN"` |

Both variables are server-side only and must never be exposed to the client. Both should be added to `.env.example` with placeholder values.

### New dependency

- `@maxmind/geoip2-node` — official MaxMind Node.js reader for `.mmdb` files

---

## Testing

### New: `src/lib/enrich-visit.test.ts`

- Hash output is deterministic for a given IP + secret
- Hash changes when the IP changes
- Hash changes when the secret changes
- Empty string IP produces a hash without error
- Returns correct country + region for a known IP (mocked GeoLite2 reader)
- Returns `"UNKNOWN"` for country and region when `GEOIP_DB_PATH` is not set
- Returns `"UNKNOWN"` when the IP is not found in the database
- Returns `"UNKNOWN"` when the `.mmdb` file is missing or corrupt

### Updated: `src/lib/record-view.test.ts`

- Mock `enrichVisit` and assert `record_view` RPC is called with `ip_hash`, `country`, `region` (not `ip`)
- Assert `enrichVisit` is called with the correct headers object
- Remove existing IP header extraction tests (that logic now lives in `enrich-visit.test.ts`)

---

## Deployment Notes

The GeoLite2-City `.mmdb` file is mounted as a volume in Coolify and referenced by `GEOIP_DB_PATH`. Updating the database requires only replacing the file on disk — no application redeploy needed.

Future work: automate updates via a cron job hitting the MaxMind download API.
