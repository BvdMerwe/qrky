import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
const mockSignInWithPassword = vi.fn();
const mockResetPasswordForEmail = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({
        auth: {
            signInWithPassword: mockSignInWithPassword,
            resetPasswordForEmail: mockResetPasswordForEmail,
        }
    }))
}));

describe('login action', () => {
    let tmpEnv: NodeJS.ProcessEnv ;

    beforeEach(() => {
        vi.clearAllMocks();
        tmpEnv = process.env;
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ADMIN_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        mockRedirect.mockImplementation((url: string) => {
            throw { url, type: 'redirect' };
        });
    });

    afterEach(() => {
        process.env = tmpEnv;
    });

    it('returns success and redirects on valid login', async () => {
        mockSignInWithPassword.mockResolvedValue({ error: null });

        const { login } = await import('@/app/login/actions');
        
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'ValidPass123!');

        try {
            await login({ message: '', success: false }, formData);
        } catch (e: unknown) {
            const err = e as { type: string; url: string };
            expect(err.type).toBe('redirect');
            expect(err.url).toBe('/dashboard/urls');
        }

        expect(mockSignInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'ValidPass123!'
        });
        expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
    });

    it('returns error for invalid credentials', async () => {
        mockSignInWithPassword.mockResolvedValue({ 
            error: { code: 'invalid_credentials', message: 'Invalid login credentials' } 
        });

        const { login } = await import('@/app/login/actions');
        
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'wrongpassword');

        const result = await login({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid login credentials');
    });

    it('returns generic error for missing email', async () => {
        const { login } = await import('@/app/login/actions');
        
        const formData = new FormData();
        formData.append('email', '');
        formData.append('password', 'ValidPass123!');

        const result = await login({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Email or password is invalid. Please try again.');
    });

    it('returns generic error for missing password', async () => {
        const { login } = await import('@/app/login/actions');
        
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', '');

        const result = await login({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Email or password is invalid. Please try again.');
    });

    it('redirects to /500 on Supabase error', async () => {
        mockSignInWithPassword.mockResolvedValue({ 
            error: { code: 'unknown_error', message: 'Something went wrong' } 
        });

        const { login } = await import('@/app/login/actions');
        
        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'ValidPass123!');

        try {
            await login({ message: '', success: false }, formData);
        } catch (e: unknown) {
            const err = e as { type: string; url: string };
            expect(err.type).toBe('redirect');
            expect(err.url).toBe('/500');
        }
    });
});

describe('resetPassword action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ADMIN_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        mockRedirect.mockImplementation((url: string) => {
            throw { url, type: 'redirect' };
        });
    });

    it('returns success message on valid email', async () => {
        mockResetPasswordForEmail.mockResolvedValue({ error: null });

        const { resetPassword } = await import('@/app/login/actions');
        
        const formData = new FormData();
        formData.append('email', 'test@example.com');

        const result = await resetPassword({ message: '', success: false }, formData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('A password reset message has been sent to your email address.');
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
            'test@example.com',
            { redirectTo: 'http://localhost:3000/login/reset-password' }
        );
    });

    it('returns error for missing email', async () => {
        const { resetPassword } = await import('@/app/login/actions');
        
        const formData = new FormData();
        formData.append('email', '');

        const result = await resetPassword({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Email is required.');
    });

    it('returns error for Supabase failure', async () => {
        mockResetPasswordForEmail.mockResolvedValue({ 
            error: { message: 'Rate limit exceeded' } 
        });

        const { resetPassword } = await import('@/app/login/actions');
        
        const formData = new FormData();
        formData.append('email', 'test@example.com');

        const result = await resetPassword({ message: '', success: false }, formData);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Rate limit exceeded');
    });
});
