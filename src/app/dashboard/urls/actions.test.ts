import { describe, it, expect, vi, beforeEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the string utilities
vi.mock('@/lib/strings', () => ({
    stringIsValid: vi.fn((data: unknown) => {
        if (typeof data !== 'string') return false;
        if (data === '') return false;
        return true;
    }),
    stringIsValidUrl: vi.fn((data: unknown, isSecure = true) => {
        if (typeof data !== 'string') return false;
        if (data === '') return false;
        const urlRegex = new RegExp(`^http${isSecure ? 's' : ''}:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\\s]*)?$`);
        return urlRegex.test(data);
    })
}));

// Mock constants
vi.mock('@/app/dashboard/urls/constants', () => ({
    STRING_TABLE_NAME_URL_OBJECTS: 'url_objects'
}));

function generateMockSupabase({
  mockUrls,
  mockAliases,
  mockQrCodes,
  mockUser,
}: {
    mockUrls: any;
    mockAliases: any;
    mockQrCodes: any;
    mockUser: any;
}) {
    const mockSupabaseFrom = vi.fn((table: string) => {
        if (table === 'url_objects') {
            return {
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({ order: vi.fn(() => ({ data: mockUrls, error: null })) }))
                }))
            };
        }
        if (table === 'aliases') {
            return {
                select: vi.fn(() => ({
                    in: vi.fn(() => ({ data: mockAliases, error: null }))
                }))
            };
        }
        if (table === 'qr_codes') {
            return {
                select: vi.fn(() => ({
                    in: vi.fn(() => ({ data: mockQrCodes, error: null }))
                }))
            };
        }
        return { select: vi.fn() };
    });
    const mockSupabase = {
        from: mockSupabaseFrom,
        auth: { getUser: vi.fn(() => ({ data: { user: mockUser }, error: null })) }
    };

    return {mockSupabase, mockSupabaseFrom};
}

describe('fetchUrls', () => {
    const mockUser = { id: 'user-123' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns URLs with aliases and qr_codes on success', async () => {
        const mockUrls = [
            { id: 1, uuid: 'abc-1', url: 'https://example1.com' },
            { id: 2, uuid: 'abc-2', url: 'https://example2.com' }
        ];
        const mockAliases = [
            { id: 101, url_object_id: 1, value: 'alias1' }
        ];
        const mockQrCodes = [
            { id: 201, url_object_id: 1, uuid: 'qr-1' }
        ];
        
        const { mockSupabase } = generateMockSupabase({
            mockUrls,
            mockAliases,
            mockQrCodes,
            mockUser,
        });

        const { fetchUrls } = await import('@/app/dashboard/urls/actions');
        
        const result = await fetchUrls(mockSupabase as any);
        
        // Verify URLs have aliases and qr_codes attached
        expect(result).toHaveLength(2);
        expect(result[0].aliases).toHaveLength(1);
        expect(result[0].qr_codes).toHaveLength(1);
        expect(result[1].aliases).toHaveLength(0);
        expect(result[1].qr_codes).toHaveLength(0);
    });

    it('fetchUrls works with provided supabase client', async () => {
        const mockUrls = [{ id: 1, uuid: 'abc-1', url: 'https://example.com' }];
        const mockAliases: { id: number; url_object_id: number; value: string }[] = [];
        const mockQrCodes: { id: string; url_object_id: number }[] = [];

        const { mockSupabase, mockSupabaseFrom } = generateMockSupabase({
            mockUrls,
            mockAliases,
            mockQrCodes,
            mockUser,
        });

        const { fetchUrls } = await import('@/app/dashboard/urls/actions');
        
        const result = await fetchUrls(mockSupabase as any);
        
        expect(mockSupabaseFrom).toHaveBeenCalledWith('url_objects');
        expect(result).toEqual(mockUrls.map(url => ({ ...url, aliases: [], qr_codes: [] })));
    });

    it('fetchUrls throws error when query fails', async () => {
        const mockSupabaseFrom = vi.fn((table: string) => {
            if (table === 'url_objects') {
                return {
                    select: vi.fn(() => ({ 
                        eq: vi.fn(() => ({ order: vi.fn(() => ({ data: null, error: new Error('Connection timeout') })) }))
                    }))
                };
            }
            return { select: vi.fn(() => ({ in: vi.fn(() => ({ data: [], error: null })) })) };
        });
        const mockSupabase = { 
            from: mockSupabaseFrom,
            auth: { getUser: vi.fn(() => ({ data: { user: mockUser }, error: null })) }
        };

        const { fetchUrls } = await import('@/app/dashboard/urls/actions');
        
        await expect(fetchUrls(mockSupabase as any)).rejects.toThrow('Connection timeout');
    });

    it('fetchUrls returns empty array when user is null', async () => {
        const mockSupabase = { 
            auth: { getUser: vi.fn(() => ({ data: { user: null }, error: null })) },
            from: vi.fn()
        };

        const { fetchUrls } = await import('@/app/dashboard/urls/actions');
        
        const result = await fetchUrls(mockSupabase as any);
        
        expect(result).toEqual([]);
        expect(mockSupabase.from).not.toHaveBeenCalled();
    });
});
