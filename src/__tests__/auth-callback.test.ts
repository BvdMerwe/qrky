import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: mockRedirect
}));

// Mock next/headers
const mockCookieStore = {
    getAll: vi.fn(() => []),
    set: vi.fn()
};

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve(mockCookieStore))
}));

// Mock supabase ssr
const mockExchangeCodeForSession = vi.fn();

vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(() => ({
        auth: {
            exchangeCodeForSession: mockExchangeCodeForSession
        }
    }))
}));

describe('Auth Callback Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ADMIN_KEY = 'test-key';
    });

    it('calls exchangeCodeForSession with provided code', async () => {
        mockExchangeCodeForSession.mockResolvedValue({ error: null });
        mockRedirect.mockImplementation((url: string) => ({ url }));

        // Import after mocks are set up
        const { GET } = await import('@/app/auth/callback/route');
        
        const request = new Request('http://localhost:3000/auth/callback?code=test-code&next=/dashboard');
        await GET(request);

        expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-code');
    });

    it('redirects to next URL when code exchange succeeds', async () => {
        mockExchangeCodeForSession.mockResolvedValue({ error: null });
        mockRedirect.mockImplementation((url: string) => ({ url }));

        const { GET } = await import('@/app/auth/callback/route');
        
        const request = new Request('http://localhost:3000/auth/callback?code=test-code&next=/dashboard/user');
        await GET(request);

        expect(mockRedirect).toHaveBeenCalledWith('/dashboard/user');
    });

    it('redirects to /dashboard by default when no next param', async () => {
        mockExchangeCodeForSession.mockResolvedValue({ error: null });
        mockRedirect.mockImplementation((url: string) => ({ url }));

        const { GET } = await import('@/app/auth/callback/route');
        
        const request = new Request('http://localhost:3000/auth/callback?code=test-code');
        await GET(request);

        expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    });

    it('redirects to login with error when code exchange fails', async () => {
        mockExchangeCodeForSession.mockResolvedValue({ error: new Error('Invalid code') });
        mockRedirect.mockImplementation((url: string) => ({ url }));

        const { GET } = await import('@/app/auth/callback/route');
        
        const request = new Request('http://localhost:3000/auth/callback?code=invalid-code');
        await GET(request);

        expect(mockRedirect).toHaveBeenCalledWith('/login?error=oauth_error');
    });

    it('redirects to login with error when no code provided', async () => {
        mockRedirect.mockImplementation((url: string) => ({ url }));

        const { GET } = await import('@/app/auth/callback/route');
        
        const request = new Request('http://localhost:3000/auth/callback');
        await GET(request);

        expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalledWith('/login?error=oauth_error');
    });
});
