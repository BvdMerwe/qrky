import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock console.error to prevent noise (declared here, set up in beforeEach)
let mockConsoleError: ReturnType<typeof vi.spyOn>;

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
let mockInsert = vi.fn();
let mockSelect = vi.fn();
let mockEq = vi.fn();

// Mock the browser supabase client
vi.mock('@/lib/supabase/browser', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            insert: mockInsert,
            select: mockSelect,
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

describe('createUrl', () => {
    beforeEach(() => {
        mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        
        // Reset mock implementations
        mockSingle = vi.fn();
        mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }));
        mockSelect = vi.fn(() => ({ eq: mockEq }));
        mockEq = vi.fn(() => ({ single: mockSingle }));
    });

    afterEach(() => {
        // Restore is handled by global vi.restoreAllMocks() in vitest.setup.ts
    });

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

        const { createUrl } = await import('./actions-browser');
        
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

        const { createUrl } = await import('./actions-browser');
        
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

        const { createUrl } = await import('./actions-browser');
        
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

        const { createUrl } = await import('./actions-browser');
        
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

        const { createUrl } = await import('./actions-browser');
        
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

        const { createUrl } = await import('./actions-browser');
        
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

        const { createUrl } = await import('./actions-browser');
        
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
        const { createUrl } = await import('./actions-browser');
        
        const formData = new FormData();
        formData.append('url', 'example.com');

        await expect(createUrl(formData)).rejects.toThrow('Invalid URL');
    });

    it('throws error for empty URL', async () => {
        const { createUrl } = await import('./actions-browser');
        
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

        const { createUrl } = await import('./actions-browser');
        
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

        const { createUrl } = await import('./actions-browser');
        
        const formData = new FormData();
        formData.append('url', 'https://example.com');
        formData.append('alias', 'my-alias');

        await expect(createUrl(formData)).rejects.toThrow('Alias insert failed');
        expect(mockConsoleError).toHaveBeenCalledWith('Alias insert failed');
    });
});
