import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock console.error to prevent noise
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

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
let mockInsert = vi.fn();
let mockUpdateFn = vi.fn();
let mockDeleteFn = vi.fn();
let mockSelect = vi.fn();
let mockEq = vi.fn();
let mockOrder = vi.fn();

// Mock the browser supabase client
vi.mock('@/lib/supabase/browser', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            insert: mockInsert,
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

describe('URL Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        
        // Reset mock implementations
        mockSingle = vi.fn();
        mockMaybeSingle = vi.fn();
        mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
        mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder }));
        mockEq = vi.fn(() => ({ single: mockSingle, maybeSingle: mockMaybeSingle, order: mockOrder }));
        mockOrder = vi.fn(() => ({ error: null, data: [] }));
        mockUpdateFn = vi.fn(() => ({ eq: mockEq }));
        mockDeleteFn = vi.fn(() => ({ eq: mockEq }));
    });

    afterEach(() => {
        mockConsoleError.mockClear();
    });

    describe('createUrl', () => {
        it('creates URL and redirects on success', async () => {
            const mockUrlData = { id: 123 };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            mockInsert.mockReturnValue({ select: vi.fn(() => ({ single: mockSingle })) });

            // Need to update the mock chain
            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => ({
                    insert: mockInsert,
                    select: mockSelect
                }))
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');

            await expect(createUrl(formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
        });

        it('creates URL with alias on success', async () => {
            const mockUrlData = { id: 123 };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            const mockAliasInsert = vi.fn(() => ({ error: null }));
            const mockAliasCheck = vi.fn(() => ({ data: null, error: null }));
            
            let fromCallCount = 0;
            const mockFrom = vi.fn(() => {
                fromCallCount++;
                if (fromCallCount === 1) {
                    return {
                        insert: mockInsert,
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                }
                if (fromCallCount === 2) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockAliasCheck })) }))
                    };
                }
                return { insert: mockAliasInsert };
            });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: mockFrom
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');
            formData.append('alias', 'my-alias');

            await expect(createUrl(formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
            
            expect(mockAliasInsert).toHaveBeenCalledWith({
                value: 'my-alias',
                url_object_id: 123
            });
        });

        it('throws error for invalid alias with special characters', async () => {
            const mockUrlData = { id: 123 };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            mockInsert.mockReturnValue({ select: vi.fn(() => ({ single: mockSingle })) });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => ({
                    insert: mockInsert,
                    select: mockSelect
                }))
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');
            formData.append('alias', 'invalid@alias');

            await expect(createUrl(formData)).rejects.toThrow('Alias can only contain letters, numbers, and hyphens');
        });

        it('throws error for reserved alias name', async () => {
            const mockUrlData = { id: 123 };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            mockInsert.mockReturnValue({ select: vi.fn(() => ({ single: mockSingle })) });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => ({
                    insert: mockInsert,
                    select: mockSelect
                }))
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');
            formData.append('alias', 'dashboard');

            await expect(createUrl(formData)).rejects.toThrow('reserved name');
        });

        it('throws error for alias that is too short', async () => {
            const mockUrlData = { id: 123 };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            mockInsert.mockReturnValue({ select: vi.fn(() => ({ single: mockSingle })) });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => ({
                    insert: mockInsert,
                    select: mockSelect
                }))
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');
            formData.append('alias', 'ab');

            await expect(createUrl(formData)).rejects.toThrow('Alias must be between 3 and 50 characters');
        });

        it('throws error for alias that already exists', async () => {
            const mockUrlData = { id: 123 };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            const mockExistingAlias = { id: 1, value: 'my-alias' };
            const mockAliasCheck = vi.fn(() => ({ data: mockExistingAlias, error: null }));
            
            let fromCallCount = 0;
            const mockFrom = vi.fn(() => {
                fromCallCount++;
                if (fromCallCount === 1) {
                    return {
                        insert: mockInsert,
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                }
                return {
                    select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockAliasCheck })) }))
                };
            });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: mockFrom
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');
            formData.append('alias', 'my-alias');

            await expect(createUrl(formData)).rejects.toThrow('Alias already exists');
        });

        it('normalizes alias to lowercase', async () => {
            const mockUrlData = { id: 123 };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            const mockAliasInsert = vi.fn(() => ({ error: null }));
            const mockAliasCheck = vi.fn(() => ({ data: null, error: null }));
            
            let fromCallCount = 0;
            const mockFrom = vi.fn(() => {
                fromCallCount++;
                if (fromCallCount === 1) {
                    return {
                        insert: mockInsert,
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                }
                if (fromCallCount === 2) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockAliasCheck })) }))
                    };
                }
                return { insert: mockAliasInsert };
            });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: mockFrom
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');
            formData.append('alias', 'My-Alias');

            await expect(createUrl(formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
            
            expect(mockAliasInsert).toHaveBeenCalledWith({
                value: 'my-alias',
                url_object_id: 123
            });
        });

        it('throws error for invalid URL without protocol', async () => {
            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'example.com');

            await expect(createUrl(formData)).rejects.toThrow('Invalid URL');
        });

        it('throws error for empty URL', async () => {
            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', '');

            await expect(createUrl(formData)).rejects.toThrow('Invalid URL');
        });

        it('throws error when supabase insert fails', async () => {
            mockSingle.mockResolvedValue({ data: null, error: new Error('DB Error') });
            mockInsert.mockReturnValue({ select: vi.fn(() => ({ single: mockSingle })) });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => ({
                    insert: mockInsert,
                    select: mockSelect
                }))
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');

            await expect(createUrl(formData)).rejects.toThrow('DB Error');
            expect(mockConsoleError).toHaveBeenCalledWith('DB Error');
        });

        it('throws error when alias insert fails', async () => {
            const mockUrlData = { id: 123 };
            mockSingle.mockResolvedValue({ data: mockUrlData, error: null });
            const aliasError = new Error('Alias insert failed');
            const mockAliasCheck = vi.fn(() => ({ data: null, error: null }));
            
            let fromCallCount = 0;
            const mockFrom = vi.fn(() => {
                fromCallCount++;
                if (fromCallCount === 1) {
                    return {
                        insert: mockInsert,
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
                    };
                }
                if (fromCallCount === 2) {
                    return {
                        select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockAliasCheck })) }))
                    };
                }
                return { insert: vi.fn(() => ({ error: aliasError })) };
            });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: mockFrom
            } as any);

            const { createUrl } = await import('./new/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');
            formData.append('alias', 'my-alias');

            await expect(createUrl(formData)).rejects.toThrow('Alias insert failed');
            expect(mockConsoleError).toHaveBeenCalledWith('Alias insert failed');
        });
    });

    describe('toggleEnabled', () => {
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

    describe('updateUrl', () => {
        it('updates URL and redirects on success', async () => {
            const mockUpdateEq = vi.fn(() => ({ error: null }));
            mockUpdateFn.mockReturnValue({ eq: mockUpdateEq });
            
            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => ({ update: mockUpdateFn }))
            } as any);

            const { updateUrl } = await import('./[uuid]/edit/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://updated-example.com');
            formData.append('uuid', 'abc-123');

            await expect(updateUrl(formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
        });

        it('throws error for invalid URL', async () => {
            const { updateUrl } = await import('./[uuid]/edit/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'not-a-valid-url');
            formData.append('uuid', 'abc-123');

            await expect(updateUrl(formData)).rejects.toThrow('Invalid URL');
        });

        it('throws error for empty URL', async () => {
            const { updateUrl } = await import('./[uuid]/edit/actions-browser');
            
            const formData = new FormData();
            formData.append('url', '');
            formData.append('uuid', 'abc-123');

            await expect(updateUrl(formData)).rejects.toThrow('Invalid URL');
        });

        it('throws error when supabase update fails', async () => {
            const dbError = new Error('Update failed - URL too long');
            const mockUpdateEq = vi.fn(() => ({ error: dbError }));
            mockUpdateFn.mockReturnValue({ eq: mockUpdateEq });
            
            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => ({ update: mockUpdateFn }))
            } as any);

            const { updateUrl } = await import('./[uuid]/edit/actions-browser');
            
            const formData = new FormData();
            formData.append('url', 'https://example.com');
            formData.append('uuid', 'abc-123');

            await expect(updateUrl(formData)).rejects.toThrow('Update failed - URL too long');
            expect(mockConsoleError).toHaveBeenCalledWith('Update failed - URL too long');
        });
    });

    describe('fetchUrls and fetchUrlsBrowser', () => {
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
            
            const mockSupabaseFrom = vi.fn((table: string) => {
                if (table === 'url_objects') {
                    return {
                        select: vi.fn(() => ({ 
                            order: vi.fn(() => ({ data: mockUrls, error: null })) 
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
            const mockSupabase = { from: mockSupabaseFrom };

            const { fetchUrls } = await import('@/app/dashboard/urls/actions');
            
            const result = await fetchUrls(mockSupabase as any);
            
            // Verify URLs have aliases and qr_codes attached
            expect(result).toHaveLength(2);
            expect(result[0].aliases).toHaveLength(1);
            expect(result[0].qr_codes).toHaveLength(1);
            expect(result[1].aliases).toHaveLength(0);
            expect(result[1].qr_codes).toHaveLength(0);
        });

        it('returns empty array when no URLs exist', async () => {
            mockOrder.mockReturnValue({ data: [], error: null });
            mockSelect.mockReturnValue({ order: mockOrder });

            const { createClient } = await import('@/lib/supabase/browser');
            vi.mocked(createClient).mockReturnValue({
                from: vi.fn(() => ({ select: mockSelect }))
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
                from: vi.fn(() => ({ select: mockSelect }))
            } as any);

            const { fetchUrlsBrowser } = await import('./actions-browser');
            
            await expect(fetchUrlsBrowser()).rejects.toThrow('Query failed');
        });

        it('fetchUrls works with provided supabase client', async () => {
            const mockUrls = [{ id: 1, uuid: 'abc-1', url: 'https://example.com' }];
            const mockAliases: { id: number; url_object_id: number; value: string }[] = [];
            const mockQrCodes: { id: string; url_object_id: number }[] = [];
            
            let callCount = 0;
            const mockSupabaseFrom = vi.fn((table: string) => {
                callCount++;
                if (table === 'url_objects') {
                    return {
                        select: vi.fn(() => ({ 
                            order: vi.fn(() => ({ data: mockUrls, error: null })) 
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
            const mockSupabase = { from: mockSupabaseFrom };

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
                            order: vi.fn(() => ({ data: null, error: new Error('Connection timeout') })) 
                        }))
                    };
                }
                return { select: vi.fn(() => ({ in: vi.fn(() => ({ data: [], error: null })) })) };
            });
            const mockSupabase = { from: mockSupabaseFrom };

            const { fetchUrls } = await import('@/app/dashboard/urls/actions');
            
            await expect(fetchUrls(mockSupabase as any)).rejects.toThrow('Connection timeout');
        });
    });
});
