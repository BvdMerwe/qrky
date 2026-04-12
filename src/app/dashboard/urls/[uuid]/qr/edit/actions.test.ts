import { describe, it, expect, vi, beforeEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { updateQrCode } from './actions';

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    RedirectType: { push: 'push' }
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

function makeSuccessMock(qrSettings: object | null = null) {
    let callCount = 0;
    return {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null
            })
        },
        from: vi.fn(() => {
            callCount++;
            return {
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({
                            data: callCount === 1
                                ? { id: 'qr-uuid', url_object_id: 'url-obj-id', settings: qrSettings }
                                : { id: 'url-obj-id', user_id: 'user-123' },
                            error: null
                        })
                    }))
                })),
                update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }))
            };
        })
    };
}

describe('updateQrCode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('throws error for missing QR code ID', async () => {
        const formData = new FormData();
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');

        await expect(updateQrCode(formData)).rejects.toThrow('Invalid input: missing QR code ID');
    });

    it('throws error for invalid foreground color', async () => {
        const formData = new FormData();
        formData.append('qr_code_id', 'test-uuid');
        formData.append('fg_color', 'not-a-color');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');

        await expect(updateQrCode(formData)).rejects.toThrow('Invalid foreground color');
    });

    it('throws error for invalid background color', async () => {
        const formData = new FormData();
        formData.append('qr_code_id', 'test-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', 'invalid');
        formData.append('corner_radius', '0.45');

        await expect(updateQrCode(formData)).rejects.toThrow('Invalid background color');
    });

    it('throws error for corner radius out of range', async () => {
        const formData = new FormData();
        formData.append('qr_code_id', 'test-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.8');

        await expect(updateQrCode(formData)).rejects.toThrow('Invalid corner radius');
    });

    it('throws error for logo file too large', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue(makeSuccessMock() as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'test-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');

        const file = new File(['x'.repeat(600 * 1024)], 'logo.png', { type: 'image/png' });
        formData.append('logo', file);

        await expect(updateQrCode(formData)).rejects.toThrow('file size must be less than 500KB');
    });

    it('throws error for invalid logo file type', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue(makeSuccessMock() as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'test-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');

        const file = new File(['test'], 'logo.gif', { type: 'image/gif' });
        formData.append('logo', file);

        await expect(updateQrCode(formData)).rejects.toThrow('only SVG, PNG, and JPG files are allowed');
    });

    it('throws error when user not authenticated', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: null },
                    error: new Error('Not authenticated')
                })
            }
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'test-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');

        await expect(updateQrCode(formData)).rejects.toThrow('Authentication required');
    });

    it('throws error when QR code not found', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: new Error('Not found')
                        })
                    }))
                }))
            }))
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'nonexistent-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');

        await expect(updateQrCode(formData)).rejects.toThrow('QR code not found');
    });

    it('saves successfully without a logo', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        const { revalidatePath } = await import('next/cache');
        vi.mocked(createClient).mockResolvedValue(makeSuccessMock() as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');

        await updateQrCode(formData);

        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/urls');
    });

    it('saves successfully with a logo upload', async () => {
        const mockUpload = vi.fn().mockResolvedValue({ error: null });
        const { createClient } = await import('@/lib/supabase/server');
        const { revalidatePath } = await import('next/cache');

        let callCount = 0;
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1
                                    ? { id: 'qr-uuid', url_object_id: 'url-obj-id', settings: null }
                                    : { id: 'url-obj-id', user_id: 'user-123' },
                                error: null
                            })
                        }))
                    })),
                    update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }))
                };
            }),
            storage: {
                from: vi.fn(() => ({
                    upload: mockUpload,
                    getPublicUrl: vi.fn().mockReturnValue({
                        data: { publicUrl: 'https://storage.example.com/qr-logos/user-123/test.png' }
                    })
                }))
            }
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');
        formData.append('logo_scale', '0.2');
        formData.append('logo', new File(['test'], 'logo.png', { type: 'image/png' }));

        await updateQrCode(formData);

        expect(mockUpload).toHaveBeenCalled();
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/urls');
    });

    it('preserves existing logoUrl when saving without a new logo file', async () => {
        const existingSettings = {
            fgColor: '#000000',
            bgColor: '#ffffff',
            cornerRadius: 0.45,
            logoUrl: 'https://storage.example.com/qr-logos/user-123/existing-logo.png',
            logoScale: 0.2
        };
        const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

        let callCount = 0;
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1
                                    ? { id: 'qr-uuid', url_object_id: 'url-obj-id', settings: existingSettings }
                                    : { id: 'url-obj-id', user_id: 'user-123' },
                                error: null
                            })
                        }))
                    })),
                    update: mockUpdate
                };
            })
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#ff0000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');
        formData.append('logo_scale', '0.2');
        // No logo file appended

        await updateQrCode(formData);

        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                settings: expect.objectContaining({
                    logoUrl: 'https://storage.example.com/qr-logos/user-123/existing-logo.png'
                })
            })
        );
    });

    it('nulls out logoUrl when clear_logo is true', async () => {
        const existingSettings = {
            fgColor: '#000000',
            bgColor: '#ffffff',
            cornerRadius: 0.45,
            logoUrl: 'https://storage.example.com/qr-logos/user-123/existing-logo.png',
            logoScale: 0.2,
            clearLogoSpace: false,
        };
        const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

        let callCount = 0;
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1
                                    ? { id: 'qr-uuid', url_object_id: 'url-obj-id', settings: existingSettings }
                                    : { id: 'url-obj-id', user_id: 'user-123' },
                                error: null
                            })
                        }))
                    })),
                    update: mockUpdate
                };
            })
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');
        formData.append('logo_scale', '0.2');
        formData.append('clear_logo', 'true');
        formData.append('clear_logo_space', 'false');

        await updateQrCode(formData);

        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                settings: expect.objectContaining({
                    logoUrl: null
                })
            })
        );
    });

    it('persists clearLogoSpace in settings when true', async () => {
        const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }));

        let callCount = 0;
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1
                                    ? { id: 'qr-uuid', url_object_id: 'url-obj-id', settings: null }
                                    : { id: 'url-obj-id', user_id: 'user-123' },
                                error: null
                            })
                        }))
                    })),
                    update: mockUpdate
                };
            })
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');
        formData.append('logo_scale', '0.2');
        formData.append('clear_logo', 'false');
        formData.append('clear_logo_space', 'true');

        await updateQrCode(formData);

        expect(mockUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                settings: expect.objectContaining({
                    clearLogoSpace: true
                })
            })
        );
    });

    it('accepts empty corner radius (uses null default)', async () => {
        const { createClient } = await import('@/lib/supabase/server');
        const { revalidatePath } = await import('next/cache');
        vi.mocked(createClient).mockResolvedValue(makeSuccessMock() as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        // No corner_radius

        await updateQrCode(formData);

        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/urls');
    });

    it('throws error when user is unauthorized (URL belongs to different user)', async () => {
        let callCount = 0;
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1
                                    ? { id: 'qr-uuid', url_object_id: 'url-obj-id', settings: null }
                                    : { id: 'url-obj-id', user_id: 'different-user-456' }, // Different user!
                                error: null
                            })
                        }))
                    }))
                };
            })
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');

        await expect(updateQrCode(formData)).rejects.toThrow('Unauthorized');
    });

    it('throws error when logo upload fails', async () => {
        const mockUpload = vi.fn().mockResolvedValue({ error: new Error('Storage error') });
        let callCount = 0;
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1
                                    ? { id: 'qr-uuid', url_object_id: 'url-obj-id', settings: null }
                                    : { id: 'url-obj-id', user_id: 'user-123' },
                                error: null
                            })
                        }))
                    }))
                };
            }),
            storage: {
                from: vi.fn(() => ({
                    upload: mockUpload
                }))
            }
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');
        formData.append('logo', new File(['test'], 'logo.png', { type: 'image/png' }));

        await expect(updateQrCode(formData)).rejects.toThrow('Failed to upload logo');
    });

    it('throws error when URL not found in second query', async () => {
        let callCount = 0;
        const { createClient } = await import('@/lib/supabase/server');
        vi.mocked(createClient).mockResolvedValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: vi.fn(() => {
                callCount++;
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({
                                data: callCount === 1
                                    ? { id: 'qr-uuid', url_object_id: 'url-obj-id', settings: null }
                                    : null, // URL not found!
                                error: callCount === 2 ? new Error('Not found') : null
                            })
                        }))
                    }))
                };
            })
        } as any);

        const formData = new FormData();
        formData.append('qr_code_id', 'qr-uuid');
        formData.append('fg_color', '#000000');
        formData.append('bg_color', '#ffffff');
        formData.append('corner_radius', '0.45');

        await expect(updateQrCode(formData)).rejects.toThrow('URL not found');
    });
});
