import { describe, it, expect } from 'vitest';
import { validateLogoScale, clampLogoScale, generateQrCode } from '@/lib/qrcode/generate';
import { ECC_H } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';

describe('generateQrCode', () => {
    it('should generate QR code with default options', async () => {
        const result = await generateQrCode({ data: 'https://example.com' });
        expect(result.svg).toContain('<svg');
        expect(result.svg).toContain('</svg>');
        expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it('should generate QR code with custom colors', async () => {
        const result = await generateQrCode({
            data: 'https://example.com',
            fgColor: '#ff0000',
            bgColor: '#00ff00',
        });
        expect(result.svg).toContain('<svg');
    });

    it('should generate QR code with custom corner radius', async () => {
        const result = await generateQrCode({
            data: 'https://example.com',
            cornerRadius: 0.2,
        });
        expect(result.svg).toContain('<svg');
    });

    it('should clamp logo scale to 0.1-0.3 range', async () => {
        const result = await generateQrCode({
            data: 'https://example.com',
            logoScale: 0.5,
        });
        expect(result.svg).toContain('<svg');
    });

    it('should accept logo URL with ECC_H', async () => {
        const result = await generateQrCode({
            data: 'https://example.com',
            logoUrl: 'https://example.com/logo.svg',
            logoScale: 0.2,
            eccLevel: ECC_H,
        });
        expect(result.svg).toContain('<svg');
    });
});

describe('validateLogoScale', () => {
    it('should return true for scale within 0.1-0.35', () => {
        expect(validateLogoScale(0.1)).toBe(true);
        expect(validateLogoScale(0.2)).toBe(true);
        expect(validateLogoScale(0.35)).toBe(true);
    });

    it('should return false for scale outside 0.1-0.35', () => {
        expect(validateLogoScale(0.05)).toBe(false);
        expect(validateLogoScale(0.36)).toBe(false);
        expect(validateLogoScale(0)).toBe(false);
        expect(validateLogoScale(1)).toBe(false);
    });
});

describe('clampLogoScale', () => {
    it('should clamp scale to valid range', () => {
        expect(clampLogoScale(0.05)).toBe(0.1);
        expect(clampLogoScale(0.45)).toBe(0.35);
        expect(clampLogoScale(0.2)).toBe(0.2);
    });
});
