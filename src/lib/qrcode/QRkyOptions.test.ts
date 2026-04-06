import { describe, it, expect } from 'vitest';
import { QRkyOptions } from '@/lib/qrcode/QRkyOptions';

describe('QRkyOptions', () => {
    describe('customLogoBuffer', () => {
        it('should default to null', () => {
            const options = new QRkyOptions();
            expect(options.customLogoBuffer).toBeNull();
        });

        it('should accept null explicitly', () => {
            const options = new QRkyOptions({ customLogoBuffer: null });
            expect(options.customLogoBuffer).toBeNull();
        });

        it('should accept Buffer', () => {
            const buffer = Buffer.from('<svg></svg>', 'utf-8');
            const options = new QRkyOptions({ customLogoBuffer: buffer });
            expect(options.customLogoBuffer).toEqual(buffer);
        });

        it('should reject non-Buffer', () => {
            expect(() => {
                new QRkyOptions({ customLogoBuffer: 'not a buffer' as unknown as Buffer });
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

    describe('logo path validation', () => {
        it('should accept null svgLogo', () => {
            const options = new QRkyOptions({ svgLogo: null });
            expect(options.svgLogo).toBeNull();
        });

        it('should accept undefined svgLogo', () => {
            const options = new QRkyOptions({});
            expect(options.svgLogo).toBeNull();
        });

        it('should reject empty string svgLogo', () => {
            const options = new QRkyOptions({ svgLogo: '' });
            expect(options.svgLogo).toBeNull();
        });

        it('should reject whitespace-only svgLogo', () => {
            const options = new QRkyOptions({ svgLogo: '   ' });
            expect(options.svgLogo).toBeNull();
        });
    });

    describe('constructor options behavior', () => {
        it('should set svgLogoCssClass via constructor', () => {
            const options = new QRkyOptions({ svgLogoCssClass: 'my-custom-class' });
            expect(options.svgLogoCssClass).toBe('my-custom-class');
        });

        it('should set clearLogoSpace via constructor', () => {
            const optionsTrue = new QRkyOptions({ clearLogoSpace: true });
            expect(optionsTrue.clearLogoSpace).toBe(true);
            
            const optionsFalse = new QRkyOptions({ clearLogoSpace: false });
            expect(optionsFalse.clearLogoSpace).toBe(false);
        });

        it('should clamp svgLogoScaleMinimum to 0-1 range via constructor', () => {
            const optionsNegative = new QRkyOptions({ svgLogoScaleMinimum: -0.5 });
            expect(optionsNegative.svgLogoScaleMinimum).toBe(0);
            
            const optionsOverOne = new QRkyOptions({ svgLogoScaleMinimum: 1.5 });
            expect(optionsOverOne.svgLogoScaleMinimum).toBe(1);
        });

        it('should clamp svgLogoScaleMaximum to 0-1 range via constructor', () => {
            const optionsNegative = new QRkyOptions({ svgLogoScaleMaximum: -0.5 });
            expect(optionsNegative.svgLogoScaleMaximum).toBe(0);
            
            const optionsOverOne = new QRkyOptions({ svgLogoScaleMaximum: 1.5 });
            expect(optionsOverOne.svgLogoScaleMaximum).toBe(1);
        });

        it('should ensure svgViewBoxSize is at least 1 via constructor', () => {
            const optionsZero = new QRkyOptions({ svgViewBoxSize: 0 });
            expect(optionsZero.svgViewBoxSize).toBe(1);
            
            const optionsNegative = new QRkyOptions({ svgViewBoxSize: -100 });
            expect(optionsNegative.svgViewBoxSize).toBe(1);
        });
    });

    describe('option inheritance from QROptions', () => {
        it('should inherit standard QR options', () => {
            const options = new QRkyOptions({
                version: 5,
                eccLevel: 3,
                quietzoneSize: 4,
                addQuietzone: true,
                bgColor: '#ffffff',
                drawLightModules: true
            });
            
            expect(options.version).toBe(5);
            expect(options.eccLevel).toBe(3);
            expect(options.quietzoneSize).toBe(4);
            expect(options.addQuietzone).toBe(true);
            expect(options.bgColor).toBe('#ffffff');
            expect(options.drawLightModules).toBe(true);
        });

        it('should allow circleRadius option', () => {
            const options = new QRkyOptions({
                circleRadius: 0.35
            });
            expect(options.circleRadius).toBe(0.35);
        });
    });
});
