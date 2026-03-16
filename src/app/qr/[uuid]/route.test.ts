import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Track mock state
let mockSelectResult: any = { count: 1, error: null };
let mockQrRenderResult = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>';

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

// Mock sharp
const mockSharpToBuffer = vi.fn();
const mockSharpJpeg = vi.fn(() => ({ toBuffer: mockSharpToBuffer }));
const mockSharp = vi.fn(() => ({ jpeg: mockSharpJpeg }));
vi.mock('sharp', () => ({
    default: mockSharp,
    __esModule: true
}));

// Mock QR libraries
vi.mock('@chillerlan/qrcode/dist/js-qrcode-node-src.cjs', () => ({
    QRCode: vi.fn(() => ({ render: () => mockQrRenderResult })),
    ECC_H: 'H'
}));

vi.mock('@/lib/qrcode', () => ({
    QRkyOptions: vi.fn(function(this: any, options: any) {
        Object.assign(this, options);
    }),
    QRkySVG: 'QRkySVG'
}));

// Mock the server supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve(mockSelectResult))
                }))
            }))
        }))
    }))
}));

function createMockRequest(url: string): NextRequest {
    return new NextRequest(new URL(url), {
        method: 'GET',
    });
}

describe('QR Code Generation Endpoint', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelectResult = { count: 1, error: null };
        mockQrRenderResult = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>';
        
        // Mock sharp to return a fake PNG buffer
        mockSharpToBuffer.mockResolvedValue(Buffer.from('fake-png-data'));
        
        // Mock notFound to throw for easier testing
        mockNotFound.mockImplementation(() => {
            throw new Error('NOT_FOUND');
        });
        
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT:${url}`);
        });
    });

    it('returns 404 for non-existent QR code', async () => {
        mockSelectResult = { count: 0, error: null };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/non-existent');
        const params = Promise.resolve({ uuid: 'non-existent' });
        
        await expect(GET(request, { params })).rejects.toThrow('NOT_FOUND');
    });

    it('returns 404 for disabled QR code', async () => {
        // When url_objects.enabled = false, the query returns count: 0
        mockSelectResult = { count: 0, error: null };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/disabled-qr');
        const params = Promise.resolve({ uuid: 'disabled-qr' });
        
        await expect(GET(request, { params })).rejects.toThrow('NOT_FOUND');
    });

    it('redirects to 500 on database error', async () => {
        mockSelectResult = { count: 0, error: { message: 'Database error' } };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/test-uuid');
        const params = Promise.resolve({ uuid: 'test-uuid' });
        
        await expect(GET(request, { params })).rejects.toThrow('REDIRECT:/500');
    });
});
