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
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetUser = vi.fn();
const mockExchangeCodeForSession = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({
        auth: {
            signInWithPassword: mockSignInWithPassword,
            signUp: mockSignUp,
            resetPasswordForEmail: mockResetPasswordForEmail,
            updateUser: mockUpdateUser,
            getUser: mockGetUser,
            exchangeCodeForSession: mockExchangeCodeForSession,
            signOut: mockSignOut
        }
    }))
}));

describe('Authentication Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ADMIN_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        mockRedirect.mockImplementation((url: string) => {
            throw { url, type: 'redirect' };
        });
    });

    describe('login action', () => {
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

    describe('register action', () => {
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

    describe('resetPassword action', () => {
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
                { redirectTo: '/login/reset-password' }
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

    describe('changePassword action', () => {
        it('returns success on valid password change', async () => {
            mockUpdateUser.mockResolvedValue({ error: null });

            const { changePassword } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('securityCode', 'valid-code-123');
            formData.append('newPassword', 'NewPass123!');
            formData.append('confirmNewPassword', 'NewPass123!');

            const result = await changePassword({ message: '', success: false }, formData);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Woohoo! Your password has been changed.');
            expect(mockUpdateUser).toHaveBeenCalledWith({
                password: 'NewPass123!',
                nonce: 'valid-code-123'
            });
        });

        it('handles code exchange before password change', async () => {
            mockExchangeCodeForSession.mockResolvedValue({ error: null });
            mockUpdateUser.mockResolvedValue({ error: null });

            const { changePassword } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('code', 'auth-code-123');
            formData.append('securityCode', 'valid-code-123');
            formData.append('newPassword', 'NewPass123!');
            formData.append('confirmNewPassword', 'NewPass123!');

            const result = await changePassword({ message: '', success: false }, formData);

            expect(mockExchangeCodeForSession).toHaveBeenCalledWith('auth-code-123');
            expect(result.success).toBe(true);
        });

        it('returns error on code exchange failure', async () => {
            mockExchangeCodeForSession.mockResolvedValue({ 
                error: { message: 'Invalid or expired code' } 
            });

            const { changePassword } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('code', 'invalid-code');
            formData.append('securityCode', 'valid-code-123');
            formData.append('newPassword', 'NewPass123!');
            formData.append('confirmNewPassword', 'NewPass123!');

            const result = await changePassword({ message: '', success: false }, formData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid or expired code');
        });

        it('returns error for weak new password', async () => {
            const { changePassword } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('securityCode', 'valid-code-123');
            formData.append('newPassword', 'weak');
            formData.append('confirmNewPassword', 'weak');

            const result = await changePassword({ message: '', success: false }, formData);

            expect(result.success).toBe(false);
            expect(result.message).toContain('Password should contain at least 8 characters');
        });

        it('returns error for password mismatch', async () => {
            const { changePassword } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('securityCode', 'valid-code-123');
            formData.append('newPassword', 'NewPass123!');
            formData.append('confirmNewPassword', 'DifferentPass123!');

            const result = await changePassword({ message: '', success: false }, formData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('New passwords do not match.');
        });

        it('returns error for missing fields', async () => {
            const { changePassword } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('securityCode', '');
            formData.append('newPassword', 'NewPass123!');
            formData.append('confirmNewPassword', 'NewPass123!');

            const result = await changePassword({ message: '', success: false }, formData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('None of the fields can be empty.');
        });

        it('returns error on updateUser failure', async () => {
            mockUpdateUser.mockResolvedValue({ 
                error: { message: 'Current password is incorrect' } 
            });

            const { changePassword } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('securityCode', 'wrong-code');
            formData.append('newPassword', 'NewPass123!');
            formData.append('confirmNewPassword', 'NewPass123!');

            const result = await changePassword({ message: '', success: false }, formData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Current password is incorrect');
        });
    });

    describe('saveUser action', () => {
        it('returns success on valid profile update', async () => {
            mockGetUser.mockResolvedValue({ 
                data: { 
                    user: { 
                        id: 'user-123', 
                        user_metadata: { first_name: 'Old', last_name: 'Name' } 
                    } 
                },
                error: null 
            });
            mockUpdateUser.mockResolvedValue({ error: null });

            const { saveUser } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('firstName', 'John');
            formData.append('lastName', 'Doe');

            const result = await saveUser({ message: '', success: false }, formData);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Your user has been updated.');
            expect(mockUpdateUser).toHaveBeenCalledWith({
                data: {
                    first_name: 'John',
                    last_name: 'Doe',
                }
            });
        });

        it('redirects to login when user not authenticated', async () => {
            mockGetUser.mockResolvedValue({ 
                data: { user: null },
                error: null 
            });

            const { saveUser } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('firstName', 'John');
            formData.append('lastName', 'Doe');

            try {
                await saveUser({ message: '', success: false }, formData);
            } catch (e: unknown) {
                const err = e as { type: string; url: string };
                expect(err.type).toBe('redirect');
                expect(err.url).toBe('/login');
            }
        });

        it('returns error for missing first name', async () => {
            const { saveUser } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('firstName', '');
            formData.append('lastName', 'Doe');

            const result = await saveUser({ message: '', success: false }, formData);

            expect(result.success).toBe(false);
            expect(result.message).toContain('First name or last name is invalid');
        });

        it('returns error for missing last name', async () => {
            const { saveUser } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('firstName', 'John');
            formData.append('lastName', '');

            const result = await saveUser({ message: '', success: false }, formData);

            expect(result.success).toBe(false);
            expect(result.message).toContain('First name or last name is invalid');
        });

        it('preserves existing user metadata when updating', async () => {
            mockGetUser.mockResolvedValue({ 
                data: { 
                    user: { 
                        id: 'user-123', 
                        user_metadata: { 
                            first_name: 'Old',
                            last_name: 'Name',
                            theme: 'dark'
                        } 
                    } 
                },
                error: null 
            });
            mockUpdateUser.mockResolvedValue({ error: null });

            const { saveUser } = await import('@/app/dashboard/user/actions');
            
            const formData = new FormData();
            formData.append('firstName', 'New');
            formData.append('lastName', 'Name');

            await saveUser({ message: '', success: false }, formData);

            expect(mockUpdateUser).toHaveBeenCalledWith({
                data: {
                    first_name: 'New',
                    last_name: 'Name',
                    theme: 'dark'
                }
            });
        });
    });

    describe('signOut action', () => {
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
});
