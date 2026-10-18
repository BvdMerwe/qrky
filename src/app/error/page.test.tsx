import { describe, it, expect, vi, beforeEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: (...args: any[]) => mockRedirect(...args),
    RedirectType: {
        push: 'push',
        replace: 'replace'
    }
}));

describe('Error Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
    });

    it('redirects to email-verification-waiting for email_not_confirmed type', async () => {
        vi.resetModules();
        const { default: ErrorPage } = await import('@/app/error/page');

        const searchParams = Promise.resolve({ type: 'email_not_confirmed', user: 'user-123' });

        await expect(ErrorPage({ searchParams })).rejects.toThrow('REDIRECT:/email-verification-waiting?user=user-123');
    });

    it('renders generic error for unknown type', async () => {
        vi.resetModules();
        const { default: ErrorPage } = await import('@/app/error/page');

        const searchParams = Promise.resolve({ type: 'verification_failed' });

        const result = await ErrorPage({ searchParams });
        expect(result).toBeDefined();
    });

    it('renders generic error when no type is provided', async () => {
        vi.resetModules();
        const { default: ErrorPage } = await import('@/app/error/page');

        const searchParams = Promise.resolve({});

        const result = await ErrorPage({ searchParams });
        expect(result).toBeDefined();
    });

    it('renders generic error when user is missing for email_not_confirmed', async () => {
        vi.resetModules();
        const { default: ErrorPage } = await import('@/app/error/page');

        const searchParams = Promise.resolve({ type: 'email_not_confirmed' });

        const result = await ErrorPage({ searchParams });
        expect(result).toBeDefined();
    });
});
