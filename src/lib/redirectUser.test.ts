import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgrestError } from '@supabase/supabase-js';

// Mock next/navigation
const mockRedirect = vi.fn();
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
    notFound: mockNotFound,
    RedirectType: {
        push: 'push',
        replace: 'replace'
    }
}));

// Mock next/headers
const mockHeaders = vi.fn(() => Promise.resolve(new Headers()));
vi.mock('next/headers', () => ({
    headers: mockHeaders
}));

// Mock record-view
const mockRecordView = vi.fn(() => Promise.resolve());
vi.mock('@/lib/record-view', () => ({
    default: mockRecordView
}));

// Mock console.error (set up in beforeEach to work with vi.restoreAllMocks)
let mockConsoleError: ReturnType<typeof vi.spyOn>;

describe('redirectUser', () => {
    beforeEach(() => {
        mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.clearAllMocks();
        
        // Make redirect and notFound throw for easier testing
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        mockNotFound.mockImplementation(() => {
            throw new Error('NOT_FOUND');
        });
    });

    it('redirects to /500 when error is present', async () => {
        const error: PostgrestError = {
            message: 'Database error',
            details: '',
            hint: '',
            code: '500',
            name: 'PostgrestError'
        };

        const { default: redirectUser } = await import('@/lib/redirectUser');

        await expect(
            redirectUser('https://example.com', error, 'qr_codes', 'test-id')
        ).rejects.toThrow('REDIRECT:/500');

        expect(mockRedirect).toHaveBeenCalledWith('/500', 'push');
        expect(mockConsoleError).toHaveBeenCalledWith('Database error');
    });

    it('calls notFound when url is null and no error', async () => {
        const { default: redirectUser } = await import('@/lib/redirectUser');

        await expect(
            redirectUser(null, null, 'aliases', 'test-alias')
        ).rejects.toThrow('NOT_FOUND');

        expect(mockNotFound).toHaveBeenCalled();
    });

    it('calls recordView then redirects when url is valid', async () => {
        const { default: redirectUser } = await import('@/lib/redirectUser');

        await expect(
            redirectUser('https://example.com', null, 'url_objects', 'test-uuid')
        ).rejects.toThrow('REDIRECT:https://example.com');

        expect(mockRecordView).toHaveBeenCalledWith(
            expect.any(Headers),
            'url_objects',
            'test-uuid'
        );
        expect(mockRedirect).toHaveBeenCalledWith('https://example.com', 'replace');
    });

    it('does NOT call recordView when error is present', async () => {
        const error: PostgrestError = {
            message: 'Not found',
            details: '',
            hint: '',
            code: '404',
            name: 'PostgrestError'
        };

        const { default: redirectUser } = await import('@/lib/redirectUser');

        await expect(
            redirectUser('https://example.com', error, 'qr_codes', 'test-id')
        ).rejects.toThrow('REDIRECT:/500');

        expect(mockRecordView).not.toHaveBeenCalled();
    });
});
