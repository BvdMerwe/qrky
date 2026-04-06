import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('fetchUrlsServer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates server supabase client and delegates to fetchUrls', async () => {
        const mockUrls = [{ id: 1, uuid: 'abc-1', url: 'https://example.com' }];
        const mockUser = { id: 'user-123' };
        
        // Mock the server createClient
        const mockCreateClient = vi.fn(() => Promise.resolve({
            from: vi.fn((table: string) => {
                if (table === 'url_objects') {
                    return {
                        select: vi.fn(() => ({ 
                            eq: vi.fn(() => ({ 
                                order: vi.fn(() => ({ data: mockUrls, error: null }))
                            }))
                        }))
                    };
                }
                return { select: vi.fn(() => ({ in: vi.fn(() => ({ data: [], error: null })) })) };
            }),
            auth: { getUser: vi.fn(() => ({ data: { user: mockUser }, error: null })) }
        }));

        vi.doMock('@/lib/supabase/server', () => ({
            createClient: mockCreateClient
        }));

        const { fetchUrlsServer } = await import('@/app/dashboard/urls/actions-server');
        
        const result = await fetchUrlsServer();
        
        expect(mockCreateClient).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0].aliases).toEqual([]);
        expect(result[0].qr_codes).toEqual([]);
    });
});
