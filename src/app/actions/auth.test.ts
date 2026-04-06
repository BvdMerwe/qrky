import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
    RedirectType: {
        push: 'push',
        replace: 'replace'
    }
}));

// Mock next/headers
const mockCookieStore = {
    getAll: vi.fn(() => []),
    set: vi.fn()
};

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve(mockCookieStore))
}));

// Mock supabase auth methods
const mockSignOut = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({
        auth: {
            signOut: mockSignOut
        }
    }))
}));

describe('signOut action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ADMIN_KEY = 'test-key';
        mockRedirect.mockImplementation((url: string) => {
            throw { url, type: 'redirect' };
        });
    });

    it('calls supabase.auth.signOut and redirects to /login', async () => {
        mockSignOut.mockResolvedValue({ error: null });

        const { signOut } = await import('@/app/actions/auth');

        try {
            await signOut();
        } catch (e: unknown) {
            const err = e as { type: string; url: string };
            expect(err.type).toBe('redirect');
            expect(err.url).toBe('/login');
        }

        expect(mockSignOut).toHaveBeenCalledOnce();
    });

    it('throws error if signOut fails (no error handling)', async () => {
        mockSignOut.mockRejectedValue(new Error('network error'));

        const { signOut } = await import('@/app/actions/auth');

        await expect(signOut()).rejects.toThrow('network error');
        expect(mockSignOut).toHaveBeenCalledOnce();
        expect(mockRedirect).not.toHaveBeenCalled();
    });
});
