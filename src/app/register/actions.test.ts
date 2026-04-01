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

// Mock next/cache
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
    revalidatePath: mockRevalidatePath
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
const mockSignUp = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({
        auth: {
            signUp: mockSignUp,
        }
    }))
}));

describe('register action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ADMIN_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        mockRedirect.mockImplementation((url: string) => {
            throw { url, type: 'redirect' };
        });
    });

    it('redirects to email-verification-waiting when user created but no session', async () => {
        mockSignUp.mockResolvedValue({ 
            error: null,
            data: {
                user: { id: 'user-123', email: 'new@example.com' },
                session: null
            }
        });

        const { register } = await import('@/app/register/actions');
        
        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'Doe');
        formData.append('email', 'new@example.com');
        formData.append('password', 'ValidPass123!');
        formData.append('confirmPassword', 'ValidPass123!');

        try {
            await register({ message: '', success: false }, formData);
        } catch (e: unknown) {
            const err = e as { type: string; url: string };
            expect(err.type).toBe('redirect');
            expect(err.url).toBe('/email-verification-waiting');
        }

        expect(mockSignUp).toHaveBeenCalledWith({
            email: 'new@example.com',
            password: 'ValidPass123!',
            options: {
                data: {
                    first_name: 'John',
                    last_name: 'Doe',
                },
                emailRedirectTo: 'http://localhost:3000/auth/confirm',
            }
        });
    });

    it('redirects to dashboard/user when user created with session', async () => {
        mockSignUp.mockResolvedValue({ 
            error: null,
            data: {
                user: { id: 'user-123', email: 'new@example.com' },
                session: { access_token: 'token-123' }
            }
        });

        const { register } = await import('@/app/register/actions');
        
        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'Doe');
        formData.append('email', 'new@example.com');
        formData.append('password', 'ValidPass123!');
        formData.append('confirmPassword', 'ValidPass123!');

        try {
            await register({ message: '', success: false }, formData);
        } catch (e: unknown) {
            const err = e as { type: string; url: string };
            expect(err.type).toBe('redirect');
            expect(err.url).toBe('/dashboard/user');
        }

        expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
    });

    it('returns error for duplicate email', async () => {
        mockSignUp.mockResolvedValue({ 
            error: { message: 'User already registered' },
            data: null
        });

        const { register } = await import('@/app/register/actions');
        
        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'Doe');
        formData.append('email', 'existing@example.com');
        formData.append('password', 'ValidPass123!');
        formData.append('confirmPassword', 'ValidPass123!');

        const result = await register({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('User already registered');
    });

    it('returns password formula for weak password', async () => {
        const { register } = await import('@/app/register/actions');
        
        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'Doe');
        formData.append('email', 'test@example.com');
        formData.append('password', 'weak');
        formData.append('confirmPassword', 'weak');

        const result = await register({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Password should contain at least 8 characters');
    });

    it('returns error for password mismatch', async () => {
        const { register } = await import('@/app/register/actions');
        
        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'Doe');
        formData.append('email', 'test@example.com');
        formData.append('password', 'ValidPass123!');
        formData.append('confirmPassword', 'DifferentPass123!');

        const result = await register({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('New passwords do not match.');
    });

    it('returns error for missing email', async () => {
        const { register } = await import('@/app/register/actions');
        
        const formData = new FormData();
        formData.append('firstName', 'John');
        formData.append('lastName', 'Doe');
        formData.append('email', '');
        formData.append('password', 'ValidPass123!');
        formData.append('confirmPassword', 'ValidPass123!');

        const result = await register({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Email or password is invalid');
    });
});
