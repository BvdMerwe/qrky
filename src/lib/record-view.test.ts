import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

const mockRpc = vi.fn();
const mockSupabase = {
    rpc: mockRpc
};

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase))
}));

describe('recordView', () => {
    let recordView: (headers: ReadonlyHeaders, objectType: "qr_codes" | "aliases" | "url_objects", identifier: string) => Promise<void>;

    beforeEach(async () => {
        vi.clearAllMocks();
        const recordViewModule = await import('@/lib/record-view');
        recordView = recordViewModule.default;
    });

    it('calls record_view RPC with correct parameters for url_objects', async () => {
        mockRpc.mockResolvedValue({ data: null, error: null });

        const headers = new Headers({
            'x-forwarded-for': '192.168.1.1',
            'user-agent': 'Test Agent'
        }) as ReadonlyHeaders;

        await recordView(headers, 'url_objects', 'test-uuid');

        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'url_objects',
            identifier: 'test-uuid',
            ip: '192.168.1.1',
            useragent: 'Test Agent'
        });
    });

    it('calls record_view RPC for qr_codes', async () => {
        mockRpc.mockResolvedValue({ data: null, error: null });

        const headers = new Headers({
            'x-forwarded-for': '10.0.0.1',
            'user-agent': 'Mobile Agent'
        }) as ReadonlyHeaders;

        await recordView(headers, 'qr_codes', 'qr-uuid');

        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'qr_codes',
            identifier: 'qr-uuid',
            ip: '10.0.0.1',
            useragent: 'Mobile Agent'
        });
    });

    it('calls record_view RPC for aliases', async () => {
        mockRpc.mockResolvedValue({ data: null, error: null });

        const headers = new Headers({
            'x-forwarded-for': '172.16.0.1',
            'user-agent': 'Browser Agent'
        }) as ReadonlyHeaders;

        await recordView(headers, 'aliases', 'alias-value');

        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'aliases',
            identifier: 'alias-value',
            ip: '172.16.0.1',
            useragent: 'Browser Agent'
        });
    });

    it('uses x-real-ip when x-forwarded-for is not available', async () => {
        mockRpc.mockResolvedValue({ data: null, error: null });

        const headers = new Headers({
            'x-real-ip': '127.0.0.1',
            'user-agent': 'Local Agent'
        }) as ReadonlyHeaders;

        await recordView(headers, 'url_objects', 'test-id');

        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'url_objects',
            identifier: 'test-id',
            ip: '127.0.0.1',
            useragent: 'Local Agent'
        });
    });

    it('uses empty string when no IP headers are present', async () => {
        mockRpc.mockResolvedValue({ data: null, error: null });

        const headers = new Headers({
            'user-agent': 'No IP Agent'
        }) as ReadonlyHeaders;

        await recordView(headers, 'url_objects', 'test-id');

        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'url_objects',
            identifier: 'test-id',
            ip: '',
            useragent: 'No IP Agent'
        });
    });

    it('uses empty string when user-agent is not present', async () => {
        mockRpc.mockResolvedValue({ data: null, error: null });

        const headers = new Headers({
            'x-forwarded-for': '192.168.1.1'
        }) as ReadonlyHeaders;

        await recordView(headers, 'url_objects', 'test-id');

        expect(mockRpc).toHaveBeenCalledWith('record_view', {
            objecttype: 'url_objects',
            identifier: 'test-id',
            ip: '192.168.1.1',
            useragent: ''
        });
    });
});
