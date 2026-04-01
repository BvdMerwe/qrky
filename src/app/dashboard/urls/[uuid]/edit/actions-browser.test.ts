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
let mockUpdateFn = vi.fn();
let mockEq = vi.fn();

// Mock the browser supabase client
vi.mock('@/lib/supabase/browser', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            update: mockUpdateFn,
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

describe('updateUrl', () => {
    beforeEach(() => {
        mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        
        // Reset mock implementations
        mockEq = vi.fn(() => ({ error: null }));
        mockUpdateFn = vi.fn(() => ({ eq: mockEq }));
    });

    afterEach(() => {
        // Restore is handled by global vi.restoreAllMocks() in vitest.setup.ts
    });

    it('updates URL and redirects on success', async () => {
        const mockUpdateEq = vi.fn(() => ({ error: null }));
        mockUpdateFn.mockReturnValue({ eq: mockUpdateEq });
        
        const { createClient } = await import('@/lib/supabase/browser');
        vi.mocked(createClient).mockReturnValue({
            from: vi.fn(() => ({ update: mockUpdateFn }))
        } as any);

        const { updateUrl } = await import('./actions-browser');
        
        const formData = new FormData();
        formData.append('url', 'https://updated-example.com');
        formData.append('uuid', 'abc-123');

        await expect(updateUrl(formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
    });

    it('throws error for invalid URL', async () => {
        const { updateUrl } = await import('./actions-browser');
        
        const formData = new FormData();
        formData.append('url', 'not-a-valid-url');
        formData.append('uuid', 'abc-123');

        await expect(updateUrl(formData)).rejects.toThrow('Invalid URL');
    });

    it('throws error for empty URL', async () => {
        const { updateUrl } = await import('./actions-browser');
        
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

        const { updateUrl } = await import('./actions-browser');
        
        const formData = new FormData();
        formData.append('url', 'https://example.com');
        formData.append('uuid', 'abc-123');

        await expect(updateUrl(formData)).rejects.toThrow('Update failed - URL too long');
        expect(mockConsoleError).toHaveBeenCalledWith('Update failed - URL too long');
    });
});
