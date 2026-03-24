import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/qrcode/generate', () => ({
    generateQrCode: vi.fn(() => ({
        svg: '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>',
        buffer: Buffer.from('<svg></svg>')
    }))
}));

vi.mock('node:fs', () => ({
    default: {}
}));

function createMockRequest(url: string): NextRequest {
    return new NextRequest(new URL(url), {
        method: 'GET',
    });
}

describe('QR Preview Endpoint', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 when data parameter is missing', async () => {
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview');
        
        const response = await GET(request);
        
        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error).toContain('data');
    });

    it('returns SVG with default settings', async () => {
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com');
        
        const response = await GET(request);
        
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('image/svg+xml');
        expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate');
    });

    it('applies custom fgColor and bgColor', async () => {
        const { generateQrCode } = await import('@/lib/qrcode/generate');
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com&fgColor=ff0000&bgColor=00ff00');
        
        const response = await GET(request);
        
        expect(response.status).toBe(200);
        expect(generateQrCode).toHaveBeenCalledWith(
            expect.objectContaining({
                data: 'https://example.com',
                fgColor: 'ff0000',
                bgColor: '00ff00',
            })
        );
    });

    it('applies custom cornerRadius', async () => {
        const { generateQrCode } = await import('@/lib/qrcode/generate');
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com&cornerRadius=0.3');
        
        await GET(request);
        
        expect(generateQrCode).toHaveBeenCalledWith(
            expect.objectContaining({
                cornerRadius: 0.3,
            })
        );
    });

    it('applies custom logoScale', async () => {
        const { generateQrCode } = await import('@/lib/qrcode/generate');
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com&logoScale=0.25');
        
        await GET(request);
        
        expect(generateQrCode).toHaveBeenCalledWith(
            expect.objectContaining({
                logoScale: 0.25,
            })
        );
    });

    it('allows empty logoUrl', async () => {
        const { generateQrCode } = await import('@/lib/qrcode/generate');
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com&logoUrl=');
        
        const response = await GET(request);
        
        expect(response.status).toBe(200);
        expect(generateQrCode).toHaveBeenCalledWith(
            expect.objectContaining({
                logoBuffer: null,
            })
        );
    });

    it('allows "default" logoUrl', async () => {
        const { generateQrCode } = await import('@/lib/qrcode/generate');
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com&logoUrl=default');
        
        const response = await GET(request);
        
        expect(response.status).toBe(200);
        expect(generateQrCode).toHaveBeenCalledWith(
            expect.objectContaining({
                logoBuffer: null,
            })
        );
    });

    it('allows Supabase Storage URL from qr-logos bucket', async () => {
        const { GET } = await import('./route');
        const logoUrl = 'https://api.qrky.app/storage/v1/object/public/qr-logos/user123/logo.png';
        const request = createMockRequest(`http://localhost:3000/api/qr/preview?data=https://example.com&logoUrl=${encodeURIComponent(logoUrl)}`);
        
        const response = await GET(request);
        
        expect(response.status).toBe(200);
    });

    it('rejects arbitrary external URL as logoUrl', async () => {
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com&logoUrl=https://evil.com/logo.png');
        
        const response = await GET(request);
        
        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error).toContain('Invalid logoUrl');
    });

    it('rejects other Supabase buckets', async () => {
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com&logoUrl=https://api.qrky.app/storage/v1/object/public/other-bucket/logo.png');
        
        const response = await GET(request);
        
        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error).toContain('Invalid logoUrl');
    });

    it('sets no-cache headers for preview', async () => {
        const { GET } = await import('./route');
        const request = createMockRequest('http://localhost:3000/api/qr/preview?data=https://example.com');
        
        const response = await GET(request);
        
        expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate');
        expect(response.headers.get('pragma')).toBe('no-cache');
        expect(response.headers.get('expires')).toBe('0');
    });
});
