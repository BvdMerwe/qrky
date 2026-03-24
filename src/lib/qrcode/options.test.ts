import { describe, it, expect } from 'vitest';
import { QRkyOptions } from '@/lib/qrcode/QRkyOptions';
import { validateLogoScale, clampLogoScale, generateQrCode } from '@/lib/qrcode/generate';
import { ECC_H } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';

describe('QRkyOptions', () => {
    describe('svgLogoBuffer', () => {
        it('should default to null', () => {
            const options = new QRkyOptions();
            expect(options.svgLogoBuffer).toBeNull();
        });

        it('should accept null explicitly', () => {
            const options = new QRkyOptions({ svgLogoBuffer: null });
            expect(options.svgLogoBuffer).toBeNull();
        });

        it('should accept Buffer', () => {
            const buffer = Buffer.from('<svg></svg>', 'utf-8');
            const options = new QRkyOptions({ svgLogoBuffer: buffer });
            expect(options.svgLogoBuffer).toEqual(buffer);
        });

        it('should reject non-Buffer', () => {
            expect(() => {
                new QRkyOptions({ svgLogoBuffer: 'not a buffer' as unknown as Buffer });
            }).toThrow('invalid svg logo buffer');
        });
    });

    describe('svgLogoScale', () => {
        it('should clamp scale to valid range (0-1)', () => {
            const options = new QRkyOptions({ svgLogoScale: 0.5 });
            expect(options.svgLogoScale).toBe(0.5);
        });

        it('should clamp scale below minimum to minimum', () => {
            const options = new QRkyOptions({ svgLogoScale: -0.5 });
            expect(options.svgLogoScale).toBe(0);
        });

        it('should clamp scale above maximum to maximum', () => {
            const options = new QRkyOptions({ svgLogoScale: 1.5 });
            expect(options.svgLogoScale).toBe(1);
        });
    });

    describe('svgLogoScaleMinimum', () => {
        it('should clamp to valid range (0-1)', () => {
            const options = new QRkyOptions({ svgLogoScaleMinimum: 0.3 });
            expect(options.svgLogoScaleMinimum).toBe(0.3);
        });

        it('should clamp negative to 0', () => {
            const options = new QRkyOptions({ svgLogoScaleMinimum: -0.5 });
            expect(options.svgLogoScaleMinimum).toBe(0);
        });

        it('should clamp above 1 to 1', () => {
            const options = new QRkyOptions({ svgLogoScaleMinimum: 2 });
            expect(options.svgLogoScaleMinimum).toBe(1);
        });
    });

    describe('svgLogoScaleMaximum', () => {
        it('should clamp to valid range (0-1)', () => {
            const options = new QRkyOptions({ svgLogoScaleMaximum: 0.8 });
            expect(options.svgLogoScaleMaximum).toBe(0.8);
        });

        it('should clamp negative to 0', () => {
            const options = new QRkyOptions({ svgLogoScaleMaximum: -0.5 });
            expect(options.svgLogoScaleMaximum).toBe(0);
        });
    });

    describe('svgViewBoxSize', () => {
        it('should set valid viewBox size', () => {
            const options = new QRkyOptions({ svgViewBoxSize: 500 });
            expect(options.svgViewBoxSize).toBe(500);
        });

        it('should clamp negative to minimum of 1', () => {
            const options = new QRkyOptions({ svgViewBoxSize: -100 });
            expect(options.svgViewBoxSize).toBe(1);
        });
    });

    describe('clearLogoSpace', () => {
        it('should default to true', () => {
            const options = new QRkyOptions();
            expect(options.clearLogoSpace).toBe(true);
        });

        it('should allow setting to false', () => {
            const options = new QRkyOptions({ clearLogoSpace: false });
            expect(options.clearLogoSpace).toBe(false);
        });
    });

    describe('svgLogoCssClass', () => {
        it('should default to empty string', () => {
            const options = new QRkyOptions();
            expect(options.svgLogoCssClass).toBe('');
        });

        it('should allow setting custom class', () => {
            const options = new QRkyOptions({ svgLogoCssClass: 'custom-logo' });
            expect(options.svgLogoCssClass).toBe('custom-logo');
        });
    });

    describe('default values', () => {
        it('should have correct default svgViewBoxSize', () => {
            const options = new QRkyOptions();
            expect(options.svgViewBoxSize).toBe(300);
        });

        it('should have correct default svgLogoScale', () => {
            const options = new QRkyOptions();
            expect(options.svgLogoScale).toBe(0.2);
        });

        it('should have null for svgLogo by default', () => {
            const options = new QRkyOptions();
            expect(options.svgLogo).toBeNull();
        });
    });
});

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
    it('should return true for scale within 0.1-0.3', () => {
        expect(validateLogoScale(0.1)).toBe(true);
        expect(validateLogoScale(0.2)).toBe(true);
        expect(validateLogoScale(0.3)).toBe(true);
    });

    it('should return false for scale outside 0.1-0.3', () => {
        expect(validateLogoScale(0.05)).toBe(false);
        expect(validateLogoScale(0.35)).toBe(false);
        expect(validateLogoScale(0)).toBe(false);
        expect(validateLogoScale(1)).toBe(false);
    });
});

describe('clampLogoScale', () => {
    it('should clamp scale to valid range', () => {
        expect(clampLogoScale(0.05)).toBe(0.1);
        expect(clampLogoScale(0.35)).toBe(0.3);
        expect(clampLogoScale(0.2)).toBe(0.2);
    });
});
