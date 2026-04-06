import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock console.error to prevent noise (declared here, set up in beforeEach)
let _mockConsoleError: ReturnType<typeof vi.spyOn>;

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
    RedirectType: {
        push: 'push'
    }
}));

// Create mock supabase methods that will be reassigned in tests
let mockSingle = vi.fn();
let mockMaybeSingle = vi.fn();
let mockUpdateFn = vi.fn();
let mockDeleteFn = vi.fn();
let mockSelect = vi.fn();
let mockEq = vi.fn();
let mockOrder = vi.fn();

// Mock the browser supabase client
vi.mock('@/lib/supabase/browser', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: mockSelect,
            update: mockUpdateFn,
            delete: mockDeleteFn
        }))
    }))
}));

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

describe('toggleEnabled', () => {
    beforeEach(() => {
        _mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        
        // Reset mock implementations
        mockSingle = vi.fn();
        mockMaybeSingle = vi.fn();
        mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder }));
        mockEq = vi.fn(() => ({ single: mockSingle, maybeSingle: mockMaybeSingle, order: mockOrder }));
        mockOrder = vi.fn(() => ({ error: null, data: [] }));
        mockUpdateFn = vi.fn(() => ({ eq: mockEq }));
        mockDeleteFn = vi.fn(() => ({ eq: mockEq }));
    });

    afterEach(() => {
        // Restore is handled by global vi.restoreAllMocks() in vitest.setup.ts
    });

    it('toggles enabled state from true to false', async () => {
        const mockUrlCurrent = { id: 123, enabled: true };
        mockMaybeSingle.mockResolvedValue({ data: mockUrlCurrent, error: null });

        const mockSelectResult = vi.fn(() => ({ 
            data: [{ id: 123, enabled: false, uuid: 'abc-123' }], 
            error: null 
        }));
        
        let fromCallCount = 0;
        const mockFrom = vi.fn(() => {
            fromCallCount++;
            if (fromCallCount === 1) {
                return {
                    select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
                };
            }
            return { 
                update: vi.fn(() => ({ 
                    select: vi.fn(() => ({ eq: mockSelectResult })) 
                })) 
            };
        });

        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: mockFrom
        } as any);

        const { toggleEnabled } = await import('./actions-browser');
        
        const result = await toggleEnabled('abc-123');
        
        expect(mockMaybeSingle).toHaveBeenCalled();
        expect(result[0].enabled).toBe(false);
    });

    it('toggles enabled state from false to true', async () => {
        const mockUrlCurrent = { id: 123, enabled: false };
        mockMaybeSingle.mockResolvedValue({ data: mockUrlCurrent, error: null });

        const mockSelectResult = vi.fn(() => ({ 
            data: [{ id: 123, enabled: true, uuid: 'abc-123' }], 
            error: null 
        }));
        
        let fromCallCount = 0;
        const mockFrom = vi.fn(() => {
            fromCallCount++;
            if (fromCallCount === 1) {
                return {
                    select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
                };
            }
            return { 
                update: vi.fn(() => ({ 
                    select: vi.fn(() => ({ eq: mockSelectResult })) 
                })) 
            };
        });

        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: mockFrom
        } as any);

        const { toggleEnabled } = await import('./actions-browser');
        
        const result = await toggleEnabled('abc-123');
        
        expect(result[0].enabled).toBe(true);
    });

    it('throws error when URL not found', async () => {
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });
        
        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
            }))
        } as any);

        const { toggleEnabled } = await import('./actions-browser');
        
        await expect(toggleEnabled('non-existent')).rejects.toThrow('URL object non-existent not found.');
    });

    it('throws error when supabase query fails', async () => {
        mockMaybeSingle.mockResolvedValue({ data: null, error: new Error('DB Connection Error') });
        
        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
            }))
        } as any);

        const { toggleEnabled } = await import('./actions-browser');
        
        await expect(toggleEnabled('abc-123')).rejects.toThrow('URL object abc-123 not found.');
    });

    it('throws error when update fails', async () => {
        const mockUrlCurrent = { id: 123, enabled: true };
        mockMaybeSingle.mockResolvedValue({ data: mockUrlCurrent, error: null });

        let fromCallCount = 0;
        const mockFrom = vi.fn(() => {
            fromCallCount++;
            if (fromCallCount === 1) {
                return {
                    select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) }))
                };
            }
            return { 
                update: vi.fn(() => ({ 
                    select: vi.fn(() => ({ 
                        eq: vi.fn(() => ({ 
                            data: null, 
                            error: new Error('Update failed') 
                        })) 
                    })) 
                })) 
            };
        });

        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: mockFrom
        } as any);

        const { toggleEnabled } = await import('./actions-browser');
        
        await expect(toggleEnabled('abc-123')).rejects.toThrow('Update failed');
    });
});

describe('deleteUrl', () => {
    beforeEach(() => {
        _mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        
        mockDeleteFn = vi.fn(() => ({ eq: mockEq }));
        mockEq = vi.fn(() => ({ single: mockSingle, maybeSingle: mockMaybeSingle, order: mockOrder }));
    });

    it('deletes URL successfully', async () => {
        const mockDeleteEq = vi.fn(() => ({ error: null }));
        mockDeleteFn.mockReturnValue({ eq: mockDeleteEq });
        
        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn(() => ({ delete: mockDeleteFn }))
        } as any);

        const { deleteUrl } = await import('./actions-browser');
        
        await expect(deleteUrl('abc-123')).resolves.not.toThrow();
    });

    it('throws error when supabase delete fails', async () => {
        const dbError = new Error('Delete failed - foreign key constraint');
        const mockDeleteEq = vi.fn(() => ({ error: dbError }));
        mockDeleteFn.mockReturnValue({ eq: mockDeleteEq });
        
        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn(() => ({ delete: mockDeleteFn }))
        } as any);

        const { deleteUrl } = await import('./actions-browser');
        
        await expect(deleteUrl('abc-123')).rejects.toThrow('Delete failed - foreign key constraint');
    });
});

describe('fetchUrlsBrowser', () => {
    const mockUser = { id: 'user-123' };

    beforeEach(() => {
        _mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        
        mockOrder = vi.fn(() => ({ error: null, data: [] }));
        mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder }));
        mockEq = vi.fn(() => ({ single: mockSingle, maybeSingle: mockMaybeSingle, order: mockOrder }));
    });

    it('returns empty array when no URLs exist', async () => {
        mockOrder.mockReturnValue({ data: [], error: null });
        mockSelect.mockReturnValue({ order: mockOrder });

        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn(() => ({ 
                select: vi.fn(() => ({ 
                    eq: vi.fn(() => ({ order: mockOrder }))
                }))
            })),
            auth: { getUser: vi.fn(() => ({ data: { user: mockUser }, error: null })) }
        } as any);

        const { fetchUrlsBrowser } = await import('./actions-browser');
        
        const result = await fetchUrlsBrowser();
        
        expect(result).toEqual([]);
    });

    it('throws error when supabase query fails', async () => {
        mockOrder.mockReturnValue({ data: null, error: new Error('Query failed') });
        mockSelect.mockReturnValue({ order: mockOrder });

        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn(() => ({ 
                select: vi.fn(() => ({ 
                    eq: vi.fn(() => ({ order: mockOrder }))
                }))
            })),
            auth: { getUser: vi.fn(() => ({ data: { user: mockUser }, error: null })) }
        } as any);

        const { fetchUrlsBrowser } = await import('./actions-browser');
        
        await expect(fetchUrlsBrowser()).rejects.toThrow('Query failed');
    });
});
