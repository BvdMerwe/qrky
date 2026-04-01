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

describe('createQrCode', () => {
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

    it('should throw error when UUID is empty', async () => {
        const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');

        const formData = new FormData();
        formData.append('uuid', '');

        await expect(createQrCode(formData)).rejects.toThrow('Invalid input: missing URL UUID');
    });

    it('should throw error when data is null but no error from URL query', async () => {
        mockSingle.mockResolvedValue({ 
            data: null, 
            error: null 
        });

        const { createQrCode } = await import('@/app/dashboard/urls/[uuid]/qr/new/actions');

        const formData = new FormData();
        formData.append('uuid', 'test-uuid-123');

        await expect(createQrCode(formData)).rejects.toThrow('URL not found');
    });
});
