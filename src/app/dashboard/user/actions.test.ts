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
const mockUpdateUser = vi.fn();
const mockGetUser = vi.fn();
const mockExchangeCodeForSession = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve({
        auth: {
            updateUser: mockUpdateUser,
            getUser: mockGetUser,
            exchangeCodeForSession: mockExchangeCodeForSession,
        }
    }))
}));

describe('changePassword action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ADMIN_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        mockRedirect.mockImplementation((url: string) => {
            throw { url, type: 'redirect' };
        });
    });

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
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ADMIN_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
        mockRedirect.mockImplementation((url: string) => {
            throw { url, type: 'redirect' };
        });
    });

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
