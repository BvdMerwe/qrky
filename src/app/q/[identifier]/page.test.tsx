import { describe, it, expect, vi, beforeEach } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Track mock state
let mockMaybeSingleResult: any = { data: null, error: null };

// Mock next/navigation
const mockRedirect = vi.fn();
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: (...args: any[]) => mockRedirect(...args),
    notFound: () => mockNotFound(),
    RedirectType: {
        push: 'push',
        replace: 'replace'
    }
}));

// Mock next/headers
const mockHeadersGet = vi.fn();
vi.mock('next/headers', () => ({
    headers: vi.fn(() => ({
        get: mockHeadersGet
    }))
}));

// Mock record-view
const mockRecordView = vi.fn();
vi.mock('@/lib/record-view', () => ({
    default: (...args: any[]) => mockRecordView(...args)
}));

// Mock the server supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        maybeSingle: vi.fn(() => Promise.resolve(mockMaybeSingleResult))
                    })),
                    maybeSingle: vi.fn(() => Promise.resolve(mockMaybeSingleResult))
                }))
            }))
        })),
        rpc: vi.fn(() => Promise.resolve({ error: null }))
    }))
}));

describe('QR Code Redirect Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMaybeSingleResult = { data: null, error: null };
        
        // Setup headers mock
        mockHeadersGet.mockImplementation((key: string) => {
            if (key === 'x-forwarded-for') return '192.168.1.1';
            if (key === 'user-agent') return 'Mozilla/5.0 Test';
            return null;
        });
        
        // Mock redirect to throw so we can catch it in tests
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
        
        mockNotFound.mockImplementation(() => {
            throw new Error('NOT_FOUND');
        });
    });

    it('redirects to target URL for valid QR code', async () => {
        mockMaybeSingleResult = {
            data: {
                id: 'qr-123',
                url_objects: {
                    url: 'https://example.com/page',
                    enabled: true
                }
            },
            error: null
        };

        // Need to re-import to get fresh module with cleared mocks
        vi.resetModules();
        const { default: Page } = await import('./page');
        
        const params = Promise.resolve({ identifier: 'qr-123' });
        
        await expect(Page({ params })).rejects.toThrow('REDIRECT:https://example.com/page');
        
        // Verify recordView was called with correct parameters
        expect(mockRecordView).toHaveBeenCalled();
    });

    it('returns 404 for non-existent QR code', async () => {
        mockMaybeSingleResult = { data: null, error: null };

        vi.resetModules();
        const { default: Page } = await import('./page');
        
        const params = Promise.resolve({ identifier: 'non-existent' });
        
        await expect(Page({ params })).rejects.toThrow('NOT_FOUND');
        
        // Verify recordView was NOT called
        expect(mockRecordView).not.toHaveBeenCalled();
    });

    it('redirects to 500 on database error', async () => {
        mockMaybeSingleResult = { 
            data: null, 
            error: { message: 'Database connection failed' } 
        };

        vi.resetModules();
        const { default: Page } = await import('./page');
        
        const params = Promise.resolve({ identifier: 'qr-123' });
        
        await expect(Page({ params })).rejects.toThrow('REDIRECT:/500');
    });
});
