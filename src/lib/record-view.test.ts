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
