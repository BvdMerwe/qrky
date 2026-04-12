import { describe, it, expect, vi, beforeEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateAlias } from './actions';

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn((url: string) => {
        throw new Error(`REDIRECT:${url}`);
    }),
    RedirectType: { push: 'push' }
}));

const initialState = { message: '', success: false };

describe('updateAlias', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns error for invalid aliasId', async () => {
        const formData = new FormData();
        formData.append('aliasId', '');
        formData.append('alias', 'valid-alias');

        const result = await updateAlias(initialState, formData);
        expect(result).toMatchObject({ message: 'Invalid input', success: false });
    });

    it('returns error for invalid alias', async () => {
        const formData = new FormData();
        formData.append('aliasId', '1');
        formData.append('alias', '');

        const result = await updateAlias(initialState, formData);
        expect(result).toMatchObject({ message: 'Invalid input', success: false });
    });

    it('returns error for alias with invalid characters', async () => {
        const formData = new FormData();
        formData.append('aliasId', '1');
        formData.append('alias', 'invalid@alias');

        const result = await updateAlias(initialState, formData);
        expect(result).toMatchObject({ message: 'Alias can only contain letters, numbers, and hyphens', success: false });
    });

    it('returns error for reserved alias name', async () => {
        const formData = new FormData();
        formData.append('aliasId', '1');
        formData.append('alias', 'dashboard');

        const result = await updateAlias(initialState, formData);
        expect(result.message).toContain('reserved name');
        expect(result.success).toBe(false);
    });

    it('returns error for alias that is too short', async () => {
        const formData = new FormData();
        formData.append('aliasId', '1');
        formData.append('alias', 'ab');

        const result = await updateAlias(initialState, formData);
        expect(result).toMatchObject({ message: 'Alias must be between 3 and 50 characters', success: false });
    });

    it('returns error when alias not found', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: null, error: new Error('Not found') }))
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append('aliasId', '999');
        formData.append('alias', 'new-alias');

        const result = await updateAlias(initialState, formData);
        expect(result).toMatchObject({ message: 'Alias not found', success: false });
    });

    it('redirects when alias value unchanged', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { id: 1, value: 'same-alias', url_object_id: 1 }, error: null }))
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append('aliasId', '1');
        formData.append('alias', 'SAME-ALIAS');

        await expect(updateAlias(initialState, formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
    });

    it('returns error when new alias already exists', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { id: 1, value: 'old-alias', url_object_id: 1 }, error: null })),
                        neq: vi.fn(() => ({
                            maybeSingle: vi.fn(() => ({ data: { id: 2, value: 'taken-alias' }, error: null }))
                        }))
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append('aliasId', '1');
        formData.append('alias', 'taken-alias');

        const result = await updateAlias(initialState, formData);
        expect(result).toMatchObject({ message: 'Alias already exists', success: false });
    });

    it('redirects on successful update', async () => {
        const mockEq = vi.fn(() => ({ error: null }));
        
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { id: 1, value: 'old-alias', url_object_id: 1 }, error: null })),
                        neq: vi.fn(() => ({
                            maybeSingle: vi.fn(() => ({ data: null, error: null }))
                        }))
                    }))
                })),
                update: vi.fn(() => ({ eq: mockEq }))
            }))
        } as any);

        const formData = new FormData();
        formData.append('aliasId', '1');
        formData.append('alias', 'new-alias');

        await expect(updateAlias(initialState, formData)).rejects.toThrow('REDIRECT:/dashboard/urls');
    });

    it('returns error when alias availability check fails', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({ data: { id: 1, value: 'old-alias', url_object_id: 1 }, error: null })),
                        neq: vi.fn(() => ({
                            maybeSingle: vi.fn(() => ({ data: null, error: new Error('Database connection error') }))
                        }))
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append('aliasId', '1');
        formData.append('alias', 'new-alias');

        const result = await updateAlias(initialState, formData);
        expect(result).toMatchObject({ message: 'Failed to check alias availability', success: false });
    });
});
