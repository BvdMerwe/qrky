# IP Anonymization + Geolocation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw IP storage in the `visits` table with HMAC-SHA256 hashes and add country/region geolocation via MaxMind GeoLite2-City.

**Architecture:** A new `enrich-visit.ts` module handles all in-flight IP work (hashing + geo lookup) and returns anonymized data. `record-view.ts` delegates to it. Two Supabase migrations update the `visits` schema and `record_view` function signature.

**Tech Stack:** Node.js `crypto` (built-in), `@maxmind/geoip2-node`, Vitest, Supabase migrations (SQL)

---

## Chunk 1: Database migrations

### Task 1: Migration — visits table schema

**Files:**
- Create: `supabase/migrations/20260401120000_anonymize_visits_ip.sql`

**Background:** The `visits` table currently has an `ip text` column. We need to rename it to `ip_hash` and add `country` and `region` columns. Existing rows (test data) are not backfilled.

- [ ] **Step 1: Create the migration file**

```sql
-- Rename ip → ip_hash; add country and region columns to visits.
-- NOTE: Pre-migration values in ip_hash are raw IPs from test data — not backfilled.

ALTER TABLE "public"."visits"
    RENAME COLUMN "ip" TO "ip_hash";

ALTER TABLE "public"."visits"
    ADD COLUMN "country" "text",
    ADD COLUMN "region" "text";
```

Save to `supabase/migrations/20260401120000_anonymize_visits_ip.sql`.

- [ ] **Step 2: Verify the file is correctly named and saved**

```bash
ls supabase/migrations/ | grep 20260401
```

Expected: `20260401120000_anonymize_visits_ip.sql`

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260401120000_anonymize_visits_ip.sql
git commit -m "chore(db): rename visits.ip to ip_hash, add country + region columns (qrky-kao)"
```

---

### Task 2: Migration — update record_view function

**Files:**
- Create: `supabase/migrations/20260401130000_update_record_view_ip_hash.sql`

**Background:** The `record_view` Postgres function currently accepts `ip text` and inserts into `visits.ip`. We need to update its signature and body to use `ip_hash`, `country`, and `region`. It must remain `SECURITY DEFINER` (set in the previous migration `20260329120000_fix_record_view_security_definer.sql`) so anonymous visitors can still trigger it.

- [ ] **Step 1: Create the migration file**

```sql
-- Update record_view to accept ip_hash, country, region instead of ip.
-- Retains SECURITY DEFINER so anonymous redirect visitors can call it.
-- DROP the old 4-argument overload first — CREATE OR REPLACE cannot replace a
-- function with a different signature; it would create a second overload instead.
DROP FUNCTION IF EXISTS "public"."record_view"("objecttype" "text", "identifier" "text", "ip" "text", "useragent" "text");

CREATE OR REPLACE FUNCTION "public"."record_view"(
    "objecttype" "text",
    "identifier" "text",
    "ip_hash" "text",
    "useragent" "text",
    "country" "text",
    "region" "text"
) RETURNS "void"
    LANGUAGE "plpgsql"
    SECURITY DEFINER
    SET search_path = public
    AS $$
DECLARE
    alias_id uuid;
    qr_code_id uuid;
    url_object_id bigint;
BEGIN
    IF objectType = 'url_objects' THEN
        SELECT id INTO url_object_id
        FROM url_objects
        WHERE id = record_view.identifier::bigint;
    END IF;

    IF objectType = 'qr_codes' THEN
        SELECT id INTO qr_code_id
        FROM qr_codes
        WHERE id = record_view.identifier::uuid;
    END IF;

    IF objectType = 'aliases' THEN
        SELECT id INTO alias_id
        FROM aliases
        WHERE id = record_view.identifier::uuid;
    END IF;

    INSERT INTO visits (ip_hash, user_agent, url_object_id, qr_code_id, alias_id, country, region)
    VALUES (ip_hash, useragent, url_object_id, qr_code_id, alias_id, country, region);
END;
$$;

ALTER FUNCTION "public"."record_view"(
    "objecttype" "text",
    "identifier" "text",
    "ip_hash" "text",
    "useragent" "text",
    "country" "text",
    "region" "text"
) OWNER TO "postgres";
```

Save to `supabase/migrations/20260401130000_update_record_view_ip_hash.sql`.

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260401130000_update_record_view_ip_hash.sql
git commit -m "chore(db): update record_view function to use ip_hash, country, region (qrky-kao)"
```

---

## Chunk 2: Install dependency + env vars

### Task 3: Install @maxmind/geoip2-node

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install the package**

```bash
pnpm add @maxmind/geoip2-node
```

- [ ] **Step 2: Verify it installed**

```bash
pnpm list @maxmind/geoip2-node
```

Expected: version number printed (e.g. `@maxmind/geoip2-node 4.x.x`)

- [ ] **Step 3: Update .env.example**

Open `.env.example` and append:

```
# IP anonymization
HMAC_SECRET=replace-with-a-long-random-secret

# Geolocation (MaxMind GeoLite2-City)
# Download from https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
GEOIP_DB_PATH=/path/to/GeoLite2-City.mmdb
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example
git commit -m "chore: add @maxmind/geoip2-node dependency and env var docs (qrky-kao)"
```

---

## Chunk 3: enrich-visit.ts — TDD

### Task 4: Write tests for enrich-visit

**Files:**
- Create: `src/lib/enrich-visit.test.ts`

**Background:** `enrichVisit` takes `ReadonlyHeaders`, extracts the IP, hashes it with HMAC-SHA256 (using `HMAC_SECRET` env var), and looks up country + region from GeoLite2 (using `GEOIP_DB_PATH` env var). The GeoLite2 reader is a module-level singleton. In tests, mock `@maxmind/geoip2-node` at the module level.

The function signature will be:
```ts
export async function enrichVisit(headers: ReadonlyHeaders): Promise<{
    ipHash: string;
    country: string;
    region: string;
}>
```

Key behaviours to test:
- Hash is deterministic: same IP + same secret → same hash
- Hash changes when IP changes
- Hash changes when secret changes
- Empty string IP produces a hash without error
- `x-forwarded-for` with comma-separated list → uses first IP
- Falls back to `x-real-ip` when `x-forwarded-for` is absent
- Falls back to `""` when neither header is present
- Returns correct country + region when GeoLite2 reader returns data
- Returns `"UNKNOWN"` for country + region when `GEOIP_DB_PATH` is not set
- Returns `"UNKNOWN"` when the IP is not found in the database
- Returns `"UNKNOWN"` when the reader throws (corrupt file / any error)

- [ ] **Step 1: Write the test file**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { createHmac } from 'crypto';

// Helper: compute expected hash for assertions
function expectedHash(ip: string, secret: string): string {
    return createHmac('sha256', secret).update(ip).digest('hex');
}

// Mock @maxmind/geoip2-node at module level
const mockCity = vi.fn();
vi.mock('@maxmind/geoip2-node', () => ({
    Reader: {
        open: vi.fn(),
    },
}));

describe('enrichVisit', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = {
            ...originalEnv,
            HMAC_SECRET: 'test-secret',
            GEOIP_DB_PATH: '/fake/path/GeoLite2-City.mmdb',
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.clearAllMocks();
    });

    async function getEnrichVisit() {
        const { Reader } = await import('@maxmind/geoip2-node');
        vi.mocked(Reader.open).mockResolvedValue({ city: mockCity } as never);
        const { enrichVisit } = await import('@/lib/enrich-visit');
        return enrichVisit;
    }

    function makeHeaders(init: Record<string, string>): ReadonlyHeaders {
        return new Headers(init) as ReadonlyHeaders;
    }

    it('produces a deterministic hash for the same IP and secret', async () => {
        mockCity.mockResolvedValue({
            country: { isoCode: 'ZA' },
            subdivisions: [{ isoCode: 'WC' }],
        });
        const enrichVisit = await getEnrichVisit();
        const headers = makeHeaders({ 'x-forwarded-for': '1.2.3.4' });
        const result1 = await enrichVisit(headers);
        vi.resetModules();
        const enrichVisit2 = await getEnrichVisit();
        const result2 = await enrichVisit2(headers);
        expect(result1.ipHash).toBe(result2.ipHash);
        expect(result1.ipHash).toBe(expectedHash('1.2.3.4', 'test-secret'));
    });

    it('hash changes when IP changes', async () => {
        mockCity.mockResolvedValue({
            country: { isoCode: 'ZA' },
            subdivisions: [{ isoCode: 'WC' }],
        });
        const enrichVisit = await getEnrichVisit();
        const r1 = await enrichVisit(makeHeaders({ 'x-forwarded-for': '1.2.3.4' }));
        vi.resetModules();
        const enrichVisit2 = await getEnrichVisit();
        const r2 = await enrichVisit2(makeHeaders({ 'x-forwarded-for': '5.6.7.8' }));
        expect(r1.ipHash).not.toBe(r2.ipHash);
    });

    it('hash changes when secret changes', async () => {
        mockCity.mockResolvedValue({
            country: { isoCode: 'ZA' },
            subdivisions: [{ isoCode: 'WC' }],
        });
        const enrichVisit = await getEnrichVisit();
        const r1 = await enrichVisit(makeHeaders({ 'x-forwarded-for': '1.2.3.4' }));
        vi.resetModules();
        process.env.HMAC_SECRET = 'different-secret';
        const enrichVisit2 = await getEnrichVisit();
        const r2 = await enrichVisit2(makeHeaders({ 'x-forwarded-for': '1.2.3.4' }));
        expect(r1.ipHash).not.toBe(r2.ipHash);
    });

    it('empty string IP produces a valid hash without error', async () => {
        mockCity.mockResolvedValue({
            country: { isoCode: 'ZA' },
            subdivisions: [{ isoCode: 'WC' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({}));
        expect(result.ipHash).toBe(expectedHash('', 'test-secret'));
    });

    it('uses the first IP from a comma-separated x-forwarded-for list', async () => {
        mockCity.mockResolvedValue({
            country: { isoCode: 'US' },
            subdivisions: [{ isoCode: 'CA' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' }));
        expect(result.ipHash).toBe(expectedHash('1.2.3.4', 'test-secret'));
    });

    it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
        mockCity.mockResolvedValue({
            country: { isoCode: 'DE' },
            subdivisions: [{ isoCode: 'BY' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-real-ip': '9.9.9.9' }));
        expect(result.ipHash).toBe(expectedHash('9.9.9.9', 'test-secret'));
    });

    it('falls back to empty string when no IP headers are present', async () => {
        mockCity.mockResolvedValue({
            country: { isoCode: 'ZA' },
            subdivisions: [{ isoCode: 'WC' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'user-agent': 'test' }));
        expect(result.ipHash).toBe(expectedHash('', 'test-secret'));
    });

    it('returns correct country and region from GeoLite2', async () => {
        mockCity.mockResolvedValue({
            country: { isoCode: 'ZA' },
            subdivisions: [{ isoCode: 'WC' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-forwarded-for': '1.2.3.4' }));
        expect(result.country).toBe('ZA');
        expect(result.region).toBe('ZA-WC');
    });

    it('returns UNKNOWN for country and region when GEOIP_DB_PATH is not set', async () => {
        delete process.env.GEOIP_DB_PATH;
        const { Reader } = await import('@maxmind/geoip2-node');
        vi.mocked(Reader.open).mockRejectedValue(new Error('no path'));
        const { enrichVisit } = await import('@/lib/enrich-visit');
        const result = await enrichVisit(makeHeaders({ 'x-forwarded-for': '1.2.3.4' }));
        expect(result.country).toBe('UNKNOWN');
        expect(result.region).toBe('UNKNOWN');
    });

    it('returns UNKNOWN when IP is not found in the database', async () => {
        mockCity.mockRejectedValue(Object.assign(new Error('not found'), { name: 'AddressNotFoundError' }));
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-forwarded-for': '0.0.0.0' }));
        expect(result.country).toBe('UNKNOWN');
        expect(result.region).toBe('UNKNOWN');
    });

    it('returns UNKNOWN when the reader throws (corrupt file)', async () => {
        mockCity.mockRejectedValue(new Error('corrupt mmdb'));
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-forwarded-for': '1.2.3.4' }));
        expect(result.country).toBe('UNKNOWN');
        expect(result.region).toBe('UNKNOWN');
    });
});
```

Save to `src/lib/enrich-visit.test.ts`.

- [ ] **Step 2: Run tests to confirm they fail (module doesn't exist yet)**

```bash
pnpm test src/lib/enrich-visit.test.ts
```

Expected: tests fail with `Cannot find module '@/lib/enrich-visit'`

- [ ] **Step 3: Commit the tests**

```bash
git add src/lib/enrich-visit.test.ts
git commit -m "test(enrich-visit): write failing tests for IP hashing and geolocation (qrky-kao)"
```

---

### Task 5: Implement enrich-visit.ts

**Files:**
- Create: `src/lib/enrich-visit.ts`

**Background:** The module initialises the GeoLite2 reader once at module load. If the reader fails to initialise (bad path, missing file), the singleton is set to `null` and geo lookups return `"UNKNOWN"`. Region is returned as an ISO 3166-2 code (`"CC-SS"` format) by combining the country code with the first subdivision's ISO code.

- [ ] **Step 1: Implement the module**

```ts
import { createHmac } from 'crypto';
import { Reader } from '@maxmind/geoip2-node';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

// Singleton GeoLite2 reader — initialised once at module load.
// If GEOIP_DB_PATH is unset or the file is unreadable, reader stays null
// and all geo lookups degrade to "UNKNOWN".
let readerPromise: Promise<InstanceType<typeof Reader> | null>;

function getReader(): Promise<InstanceType<typeof Reader> | null> {
    if (!readerPromise) {
        const dbPath = process.env.GEOIP_DB_PATH;
        if (!dbPath) {
            readerPromise = Promise.resolve(null);
        } else {
            readerPromise = Reader.open(dbPath).catch(() => null);
        }
    }
    return readerPromise;
}

function hashIp(ip: string): string {
    const secret = process.env.HMAC_SECRET ?? '';
    return createHmac('sha256', secret).update(ip).digest('hex');
}

function extractIp(headers: ReadonlyHeaders): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        // x-forwarded-for may be a comma-separated list; use the first (client) IP
        return forwarded.split(',')[0].trim();
    }
    return headers.get('x-real-ip') ?? '';
}

export interface VisitEnrichment {
    ipHash: string;
    country: string;
    region: string;
}

export async function enrichVisit(headers: ReadonlyHeaders): Promise<VisitEnrichment> {
    const ip = extractIp(headers);
    const ipHash = hashIp(ip);

    const reader = await getReader();
    if (!reader) {
        return { ipHash, country: 'UNKNOWN', region: 'UNKNOWN' };
    }

    try {
        const response = await reader.city(ip);
        const countryCode = response.country?.isoCode ?? 'UNKNOWN';
        const subdivisionCode = response.subdivisions?.[0]?.isoCode;
        const region = subdivisionCode ? `${countryCode}-${subdivisionCode}` : 'UNKNOWN';
        return { ipHash, country: countryCode, region };
    } catch {
        return { ipHash, country: 'UNKNOWN', region: 'UNKNOWN' };
    }
}
```

Save to `src/lib/enrich-visit.ts`.

- [ ] **Step 2: Run the tests**

```bash
pnpm test src/lib/enrich-visit.test.ts
```

Expected: all tests pass

- [ ] **Step 3: Run full test suite to check for regressions**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/enrich-visit.ts
git commit -m "feat(enrich-visit): implement IP hashing and GeoLite2 geolocation (qrky-kao)"
```

---

## Chunk 4: Update record-view.ts — TDD

### Task 6: Update record-view tests

**Files:**
- Modify: `src/lib/record-view.test.ts`

**Background:** `record-view.ts` currently extracts the IP itself and passes it as `ip` to the RPC. After this change, it will:
1. Call `enrichVisit(headers)` to get `{ ipHash, country, region }`
2. Pass `ip_hash`, `country`, `region` to the `record_view` RPC (not `ip`)

The tests must:
- Mock `@/lib/enrich-visit` (not the IP headers)
- Assert `enrichVisit` is called with the headers object
- Assert `record_view` RPC is called with `ip_hash`, `country`, `region`
- Remove all existing IP header extraction tests (those now live in `enrich-visit.test.ts`)

- [ ] **Step 1: Replace the test file contents**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

const mockRpc = vi.fn();
const mockSupabase = { rpc: mockRpc };
const mockEnrichVisit = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/enrich-visit', () => ({
    enrichVisit: mockEnrichVisit,
}));

describe('recordView', () => {
    let recordView: (
        headers: ReadonlyHeaders,
        objectType: 'qr_codes' | 'aliases' | 'url_objects',
        identifier: string
    ) => Promise<void>;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockEnrichVisit.mockResolvedValue({
            ipHash: 'abc123hash',
            country: 'ZA',
            region: 'ZA-WC',
        });
        mockRpc.mockResolvedValue({ data: null, error: null });
        const mod = await import('@/lib/record-view');
        recordView = mod.default;
    });

    it('calls enrichVisit with the headers object', async () => {
        const headers = new Headers({ 'x-forwarded-for': '1.2.3.4' }) as ReadonlyHeaders;
        await recordView(headers, 'url_objects', 'test-uuid');
        expect(mockEnrichVisit).toHaveBeenCalledWith(headers);
    });

    it('calls record_view RPC with ip_hash, country, region for url_objects', async () => {
        const headers = new Headers({ 'user-agent': 'Test Agent' }) as ReadonlyHeaders;
        await recordView(headers, 'url_objects', 'test-uuid');
        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'url_objects',
            identifier: 'test-uuid',
            ip_hash: 'abc123hash',
            useragent: 'Test Agent',
            country: 'ZA',
            region: 'ZA-WC',
        });
    });

    it('calls record_view RPC with correct params for qr_codes', async () => {
        const headers = new Headers({ 'user-agent': 'Mobile Agent' }) as ReadonlyHeaders;
        await recordView(headers, 'qr_codes', 'qr-uuid');
        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'qr_codes',
            identifier: 'qr-uuid',
            ip_hash: 'abc123hash',
            useragent: 'Mobile Agent',
            country: 'ZA',
            region: 'ZA-WC',
        });
    });

    it('calls record_view RPC with correct params for aliases', async () => {
        const headers = new Headers({ 'user-agent': 'Browser' }) as ReadonlyHeaders;
        await recordView(headers, 'aliases', 'alias-uuid');
        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'aliases',
            identifier: 'alias-uuid',
            ip_hash: 'abc123hash',
            useragent: 'Browser',
            country: 'ZA',
            region: 'ZA-WC',
        });
    });

    it('uses empty string for user-agent when header is absent', async () => {
        const headers = new Headers({}) as ReadonlyHeaders;
        await recordView(headers, 'url_objects', 'test-id');
        expect(mockRpc).toHaveBeenCalledWith('record_view', expect.objectContaining({
            useragent: '',
        }));
    });
});
```

- [ ] **Step 2: Run the updated tests to confirm they fail (implementation not updated yet)**

```bash
pnpm test src/lib/record-view.test.ts
```

Expected: tests fail — `record-view.ts` still passes `ip` to RPC, not `ip_hash`/`country`/`region`

- [ ] **Step 3: Commit the updated tests**

```bash
git add src/lib/record-view.test.ts
git commit -m "test(record-view): update tests to assert enrichVisit delegation (qrky-kao)"
```

---

### Task 7: Update record-view.ts implementation

**Files:**
- Modify: `src/lib/record-view.ts`

- [ ] **Step 1: Replace the implementation**

```ts
import { createClient } from '@/lib/supabase/server';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { enrichVisit } from '@/lib/enrich-visit';

export default async function recordView(
    headers: ReadonlyHeaders,
    objectType: 'qr_codes' | 'aliases' | 'url_objects',
    identifier: string
): Promise<void> {
    const supabase = await createClient();
    const { ipHash, country, region } = await enrichVisit(headers);
    const userAgent = headers.get('user-agent') ?? '';

    await supabase.rpc('record_view', {
        objecttype: objectType,
        identifier,
        ip_hash: ipHash,
        useragent: userAgent,
        country,
        region,
    });
}
```

- [ ] **Step 2: Run the record-view tests**

```bash
pnpm test src/lib/record-view.test.ts
```

Expected: all tests pass

- [ ] **Step 3: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/record-view.ts
git commit -m "feat(record-view): delegate to enrichVisit, pass ip_hash/country/region to RPC (qrky-kao)"
```

---

## Chunk 5: Quality gates + wrap-up

### Task 8: Run all quality gates

- [ ] **Step 1: Lint**

```bash
pnpm lint
```

Expected: 0 errors

- [ ] **Step 2: Full test suite**

```bash
pnpm test
```

Expected: all tests pass

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: build succeeds with no errors

- [ ] **Step 4: Coverage check**

```bash
pnpm test:coverage
```

Expected: statements ≥ 90%, branches ≥ 85%, functions ≥ 95% (project thresholds — new module should improve coverage)

- [ ] **Step 5: Close the beads issue and push**

```bash
BD_ACTOR="Claude" bd close qrky-kao --reason "IP anonymization and geolocation implemented"
git pull --rebase
git push
git status
```

Expected: `git status` shows "Your branch is up to date with 'origin/mvp-completion'"
