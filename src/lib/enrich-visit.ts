import { createHmac } from 'crypto';
import { Reader } from '@maxmind/geoip2-node';
import ReaderModel from '@maxmind/geoip2-node/dist/src/readerModel';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

const STRING_KEY_UNKNOWN = 'UNKNOWN';

// Singleton GeoLite2 reader — initialised once at module load.
// If GEOIP_DB_PATH is unset or the file is unreadable, reader stays null
// and all geo lookups degrade to "UNKNOWN".
let readerPromise: Promise<ReaderModel | null>;

function getReader(): Promise<ReaderModel | null> {
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
        return { ipHash, country: STRING_KEY_UNKNOWN, region: STRING_KEY_UNKNOWN };
    }

    try {
        const response = reader.city(ip);
        const countryCode = response.country?.isoCode ?? STRING_KEY_UNKNOWN;
        const subdivisionCode = response.subdivisions?.[0]?.isoCode;
        const region = subdivisionCode ? `${countryCode}-${subdivisionCode}` : STRING_KEY_UNKNOWN;
        return { ipHash, country: countryCode, region };
    } catch {
        return { ipHash, country: STRING_KEY_UNKNOWN, region: STRING_KEY_UNKNOWN };
    }
}
