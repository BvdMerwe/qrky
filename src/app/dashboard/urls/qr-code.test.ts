import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: mockRedirect,
    RedirectType: { push: 'push' }
}));

// Mock next/cache
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
    revalidatePath: mockRevalidatePath
}));

// Mock supabase server client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockInsert = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
    from: mockFrom
};

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase))
}));

describe('QR Code Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup default mock chain
        mockSelect.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ single: mockSingle });
        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert
        });
    });

    describe('createQrCode', () => {
        it('should create QR code successfully and redirect', async () => {
            // Setup mocks
            mockSingle.mockResolvedValue({ 
                data: { id: 123 }, 
                error: null 
            });
            mockInsert.mockReturnValue({
                select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 456 }, error: null }) })
            });

            // Import after mocks
            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');

            const formData = new FormData();
            formData.append('uuid', 'test-uuid-123');

            await createQrCode(formData);

            expect(mockFrom).toHaveBeenCalledWith('url_objects');
            expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/urls');
            expect(mockRedirect).toHaveBeenCalledWith('/dashboard/urls', 'push');
        });

        it('should throw error when UUID is missing', async () => {
            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');

            const formData = new FormData();
            // No uuid appended

            await expect(createQrCode(formData)).rejects.toThrow('Invalid input: missing URL UUID');
        });

        it('should throw error when URL is not found', async () => {
            mockSingle.mockResolvedValue({ 
                data: null, 
                error: { message: 'Not found' } 
            });

            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');

            const formData = new FormData();
            formData.append('uuid', 'non-existent-uuid');

            await expect(createQrCode(formData)).rejects.toThrow('URL not found');
        });

        it('should throw error when Supabase insert fails', async () => {
            mockSingle.mockResolvedValueOnce({ 
                data: { id: 123 }, 
                error: null 
            });
            
            const mockError = new Error('Insert failed');
            mockInsert.mockResolvedValue({ error: mockError });

            const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');

            const formData = new FormData();
            formData.append('uuid', 'test-uuid-123');

            await expect(createQrCode(formData)).rejects.toThrow('Insert failed');
        });
    });

    describe('updateQrCode', () => {
        it('should update QR code successfully and redirect', async () => {
            const mockEq = vi.fn();
            const mockUpdate = vi.fn();
            
            mockEq.mockResolvedValue({ error: null });
            mockUpdate.mockReturnValue({ eq: mockEq });
            
            mockSingle.mockResolvedValue({ 
                data: { id: 456, url_object_id: 'url-obj-id' }, 
                error: null 
            });

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
                },
                from: vi.fn(() => ({
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({ data: { id: 'url-obj-id', user_id: 'user-123' }, error: null })
                        }))
                    })),
                    update: mockUpdate
                }))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');

            const formData = new FormData();
            formData.append('qr_code_id', '456');
            formData.append('url_uuid', 'test-uuid-123');
            formData.append('fg_color', '#000000');
            formData.append('bg_color', '#ffffff');

            await updateQrCode(formData);

            expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/urls');
            expect(mockRedirect).toHaveBeenCalledWith('/dashboard/urls', 'push');
        });

        it('should throw error when QR code ID is missing', async () => {
            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');

            const formData = new FormData();
            formData.append('url_uuid', 'test-uuid-123');
            // No qr_code_id

            await expect(updateQrCode(formData)).rejects.toThrow('Invalid input: missing QR code ID');
        });

        it('should throw error when QR code is not found', async () => {
            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
                },
                from: vi.fn(() => ({
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
                        }))
                    }))
                }))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');

            const formData = new FormData();
            formData.append('qr_code_id', 'non-existent-id');
            formData.append('url_uuid', 'test-uuid-123');
            formData.append('fg_color', '#000000');
            formData.append('bg_color', '#ffffff');

            await expect(updateQrCode(formData)).rejects.toThrow('QR code not found');
        });

        it('should work with only qr_code_id (url_uuid is optional)', async () => {
            const mockEq = vi.fn();
            const mockUpdate = vi.fn();
            
            mockEq.mockResolvedValue({ error: null });
            mockUpdate.mockReturnValue({ eq: mockEq });

            const { createClient } = await import('@/lib/supabase/server');
            vi.mocked(createClient).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
                },
                from: vi.fn(() => ({
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({ data: { id: 'url-obj-id', user_id: 'user-123' }, error: null })
                        }))
                    })),
                    update: mockUpdate
                }))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);

            const { updateQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/edit/actions');

            const formData = new FormData();
            formData.append('qr_code_id', '456');
            formData.append('fg_color', '#000000');
            formData.append('bg_color', '#ffffff');
            // No url_uuid appended

            await updateQrCode(formData);

            expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/urls');
        });
    });
});
