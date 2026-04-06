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
        mockCity.mockReturnValue({
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
        mockCity.mockReturnValue({
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
        mockCity.mockReturnValue({
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
        mockCity.mockReturnValue({
            country: { isoCode: 'ZA' },
            subdivisions: [{ isoCode: 'WC' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({}));
        expect(result.ipHash).toBe(expectedHash('', 'test-secret'));
    });

    it('uses the first IP from a comma-separated x-forwarded-for list', async () => {
        mockCity.mockReturnValue({
            country: { isoCode: 'US' },
            subdivisions: [{ isoCode: 'CA' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' }));
        expect(result.ipHash).toBe(expectedHash('1.2.3.4', 'test-secret'));
    });

    it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
        mockCity.mockReturnValue({
            country: { isoCode: 'DE' },
            subdivisions: [{ isoCode: 'BY' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-real-ip': '9.9.9.9' }));
        expect(result.ipHash).toBe(expectedHash('9.9.9.9', 'test-secret'));
    });

    it('falls back to empty string when no IP headers are present', async () => {
        mockCity.mockReturnValue({
            country: { isoCode: 'ZA' },
            subdivisions: [{ isoCode: 'WC' }],
        });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'user-agent': 'test' }));
        expect(result.ipHash).toBe(expectedHash('', 'test-secret'));
    });

    it('returns correct country and region from GeoLite2', async () => {
        mockCity.mockReturnValue({
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
        mockCity.mockImplementation(() => { throw Object.assign(new Error('not found'), { name: 'AddressNotFoundError' }); });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-forwarded-for': '0.0.0.0' }));
        expect(result.country).toBe('UNKNOWN');
        expect(result.region).toBe('UNKNOWN');
    });

    it('returns UNKNOWN when the reader throws (corrupt file)', async () => {
        mockCity.mockImplementation(() => { throw new Error('corrupt mmdb'); });
        const enrichVisit = await getEnrichVisit();
        const result = await enrichVisit(makeHeaders({ 'x-forwarded-for': '1.2.3.4' }));
        expect(result.country).toBe('UNKNOWN');
        expect(result.region).toBe('UNKNOWN');
    });
});
