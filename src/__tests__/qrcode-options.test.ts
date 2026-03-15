import { describe, it, expect } from 'vitest';
import { QRkyOptions } from '@/lib/qrcode/QRkyOptions';

describe('QRkyOptions', () => {
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
