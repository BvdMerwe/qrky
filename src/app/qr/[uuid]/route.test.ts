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
    QRkySVG: 'QRkySVG',
    generateQrCode: vi.fn(() => Promise.resolve({ buffer: Buffer.from('<svg></svg>') }))
}));

// Mock the server supabase client
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve(mockSelectResult))
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
        mockSelectResult = { data: { id: 'test-id', settings: null, url_objects: { enabled: true } }, error: null };
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
        mockSelectResult = { data: null, error: { message: 'Not found' } };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/non-existent');
        const params = Promise.resolve({ uuid: 'non-existent' });
        
        await expect(GET(request, { params })).rejects.toThrow('REDIRECT:/500');
    });

    it('returns 404 for disabled QR code', async () => {
        mockSelectResult = { data: { id: 'test-id', settings: null, url_objects: { enabled: false } }, error: null };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/disabled-qr');
        const params = Promise.resolve({ uuid: 'disabled-qr' });
        
        await expect(GET(request, { params })).rejects.toThrow('NOT_FOUND');
    });

    it('redirects to 500 on database error', async () => {
        mockSelectResult = { data: null, error: { message: 'Database error' } };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/test-uuid');
        const params = Promise.resolve({ uuid: 'test-uuid' });
        
        await expect(GET(request, { params })).rejects.toThrow('REDIRECT:/500');
    });

    it('returns JPEG with correct Content-Type on success', async () => {
        mockSelectResult = { 
            data: { 
                id: 'test-uuid', 
                settings: { fgColor: '#000000', bgColor: '#ffffff', cornerRadius: 0.45, logoScale: 0.2, logoUrl: null, clearLogoSpace: false },
                url_objects: { enabled: true }
            }, 
            error: null 
        };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/test-uuid');
        const params = Promise.resolve({ uuid: 'test-uuid' });
        
        const response = await GET(request, { params });
        
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    });

    it('preview mode overrides colors from query params', async () => {
        mockSelectResult = { 
            data: { 
                id: 'test-uuid', 
                settings: { fgColor: '#000000', bgColor: '#ffffff', cornerRadius: 0.45, logoScale: 0.2, logoUrl: null, clearLogoSpace: false },
                url_objects: { enabled: true }
            }, 
            error: null 
        };
        
        vi.resetModules();
        
        // Mock generateQrCode to capture the options
        let capturedOptions: any;
        vi.doMock('@/lib/qrcode', () => ({
            generateQrCode: vi.fn((opts: any) => {
                capturedOptions = opts;
                return Promise.resolve({ buffer: Buffer.from('<svg></svg>') });
            })
        }));
        
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/test-uuid?preview=true&fg=ff0000&bg=00ff00');
        const params = Promise.resolve({ uuid: 'test-uuid' });
        
        await GET(request, { params });
        
        expect(capturedOptions.fgColor).toBe('#ff0000');
        expect(capturedOptions.bgColor).toBe('#00ff00');
    });

    it('preview mode sets no-cache headers', async () => {
        mockSelectResult = { 
            data: { 
                id: 'test-uuid', 
                settings: { fgColor: '#000000', bgColor: '#ffffff', cornerRadius: 0.45, logoScale: 0.2, logoUrl: null, clearLogoSpace: false },
                url_objects: { enabled: true }
            }, 
            error: null 
        };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/test-uuid?preview=true');
        const params = Promise.resolve({ uuid: 'test-uuid' });
        
        const response = await GET(request, { params });
        
        expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store');
    });

    it('non-preview mode sets long-cache headers', async () => {
        mockSelectResult = { 
            data: { 
                id: 'test-uuid', 
                settings: { fgColor: '#000000', bgColor: '#ffffff', cornerRadius: 0.45, logoScale: 0.2, logoUrl: null, clearLogoSpace: false },
                url_objects: { enabled: true }
            }, 
            error: null 
        };
        
        vi.resetModules();
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/test-uuid');
        const params = Promise.resolve({ uuid: 'test-uuid' });
        
        const response = await GET(request, { params });
        
        expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    });

    it('preview mode falls back to saved settings when query params absent', async () => {
        mockSelectResult = { 
            data: { 
                id: 'test-uuid', 
                settings: { fgColor: '#123456', bgColor: '#abcdef', cornerRadius: 0.3, logoScale: 0.15, logoUrl: 'https://example.com/logo.png', clearLogoSpace: true },
                url_objects: { enabled: true }
            }, 
            error: null 
        };
        
        vi.resetModules();
        
        // Mock generateQrCode to capture the options
        let capturedOptions: any;
        vi.doMock('@/lib/qrcode', () => ({
            generateQrCode: vi.fn((opts: any) => {
                capturedOptions = opts;
                return Promise.resolve({ buffer: Buffer.from('<svg></svg>') });
            })
        }));
        
        const { GET } = await import('./route');
        
        const request = createMockRequest('http://localhost:3000/qr/test-uuid?preview=true');
        const params = Promise.resolve({ uuid: 'test-uuid' });
        
        await GET(request, { params });
        
        expect(capturedOptions.fgColor).toBe('#123456');
        expect(capturedOptions.bgColor).toBe('#abcdef');
        expect(capturedOptions.cornerRadius).toBe(0.3);
        expect(capturedOptions.logoScale).toBe(0.15);
        expect(capturedOptions.logoUrl).toBe('https://example.com/logo.png');
        expect(capturedOptions.logoClearSpace).toBe(true);
    });
});
