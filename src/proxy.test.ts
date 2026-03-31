import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Track mock state
let mockUser: any = null;

// Mock NextResponse - must be defined inline in factory
vi.mock('next/server', async () => {
    const actual = await vi.importActual('next/server');
    return {
        ...actual,
        NextResponse: {
            next: vi.fn((config?: any) => ({
                cookies: {
                    set: vi.fn(),
                    getAll: vi.fn(() => []),
                }
            })),
            redirect: vi.fn((url: URL) => ({ url: url.toString() })),
        },
    };
});

// Mock @supabase/ssr
const mockGetUser = vi.fn();
vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(() => ({
        auth: {
            getUser: mockGetUser
        }
    }))
}));

function createMockRequest(url: string): NextRequest {
    return new NextRequest(new URL(url), {
        method: 'GET',
    });
}

describe('Proxy Middleware (Auth Guard)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = null;
        mockGetUser.mockResolvedValue({ data: { user: mockUser } });
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    });

    it('redirects unauthenticated user from /dashboard to /login', async () => {
        mockUser = null;
        mockGetUser.mockResolvedValue({ data: { user: null } });

        vi.resetModules();
        const { proxy } = await import('./proxy');

        const request = createMockRequest('http://localhost:3000/dashboard');
        const response = await proxy(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: '/login'
            })
        );
        expect(response).toHaveProperty('url');
        expect(response.url).toContain('/login');
    });

    it('allows unauthenticated user on /login (pass through)', async () => {
        mockUser = null;
        mockGetUser.mockResolvedValue({ data: { user: null } });

        vi.resetModules();
        const { proxy } = await import('./proxy');

        const request = createMockRequest('http://localhost:3000/login');
        await proxy(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('redirects authenticated but unverified user from /dashboard to /email-verification-waiting', async () => {
        mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: null
        };
        mockGetUser.mockResolvedValue({ data: { user: mockUser } });

        vi.resetModules();
        const { proxy } = await import('./proxy');

        const request = createMockRequest('http://localhost:3000/dashboard');
        const response = await proxy(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: '/email-verification-waiting'
            })
        );
        expect(response).toHaveProperty('url');
        expect(response.url).toContain('/email-verification-waiting');
    });

    it('redirects authenticated verified user from /email-verification-waiting to /dashboard/user', async () => {
        mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: '2024-01-01T00:00:00Z'
        };
        mockGetUser.mockResolvedValue({ data: { user: mockUser } });

        vi.resetModules();
        const { proxy } = await import('./proxy');

        const request = createMockRequest('http://localhost:3000/email-verification-waiting');
        const response = await proxy(request);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: '/dashboard/user'
            })
        );
        expect(response).toHaveProperty('url');
        expect(response.url).toContain('/dashboard/user');
    });

    it('allows authenticated verified user on /dashboard (pass through)', async () => {
        mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: '2024-01-01T00:00:00Z'
        };
        mockGetUser.mockResolvedValue({ data: { user: mockUser } });

        vi.resetModules();
        const { proxy } = await import('./proxy');

        const request = createMockRequest('http://localhost:3000/dashboard');
        await proxy(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('allows public route /q/[id] regardless of auth state', async () => {
        mockUser = null;
        mockGetUser.mockResolvedValue({ data: { user: null } });

        vi.resetModules();
        const { proxy } = await import('./proxy');

        const request = createMockRequest('http://localhost:3000/q/abc123');
        await proxy(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('allows public route /u/[id] regardless of auth state', async () => {
        mockUser = null;
        mockGetUser.mockResolvedValue({ data: { user: null } });

        vi.resetModules();
        const { proxy } = await import('./proxy');

        const request = createMockRequest('http://localhost:3000/u/abc123');
        await proxy(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
});
