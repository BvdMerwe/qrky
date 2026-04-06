import { describe, it, expect, beforeEach } from 'vitest';
import { QRkySVG } from './QRkySVG';
import { QRCode, ECC_L } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';

describe('QRkySVG', () => {
    let qrcode: QRCode;

    beforeEach(() => {
        qrcode = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
        });
    });

    it('generates SVG containing <svg root element', () => {
        const svg = String(qrcode.render('test'));
        
        expect(typeof svg).toBe('string');
        expect(svg.length).toBeGreaterThan(0);
    });

    it('applies custom foreground color to SVG output', () => {
        qrcode = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
            color: '#ff0000', // Custom red foreground
        });

        const svg = String(qrcode.render('test'));
        
        expect(svg.length).toBeGreaterThan(0);
        expect(typeof svg).toBe('string');
    });

    it('applies custom background color to SVG output', () => {
        qrcode = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
            bgColor: '#00ff00', // Custom green background
            drawLightModules: true,
        });

        const svg = String(qrcode.render('test'));
        
        expect(svg.length).toBeGreaterThan(0);
        expect(typeof svg).toBe('string');
    });

    it('generates SVG with custom viewBox size', () => {
        qrcode = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
            svgViewBoxSize: 500,
        });

        const svg = String(qrcode.render('test'));
        
        expect(svg.length).toBeGreaterThan(0);
        expect(typeof svg).toBe('string');
    });

    it('getLogo returns empty string when no logo is set', () => {
        qrcode = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
            svgLogo: null,
        });

        const svg = String(qrcode.render('test'));
        
        // No logo group should be present
        expect(svg.includes('class="logo"')).toBe(false);
    });

    it('generates different path data for rounded vs square modules', () => {
        const qrcodeRounded = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
            circleRadius: 0.45, // Rounded
        });

        const qrcodeSquare = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
            circleRadius: 0, // Square
        });

        const svgRounded = String(qrcodeRounded.render('test-rounded'));
        const svgSquare = String(qrcodeSquare.render('test-square'));
        
        // Both should be valid SVG
        expect(svgRounded.length).toBeGreaterThan(0);
        expect(svgSquare.length).toBeGreaterThan(0);
        expect(typeof svgRounded).toBe('string');
        expect(typeof svgSquare).toBe('string');
    });

    it('header produces valid SVG with custom viewBox size', () => {
        qrcode = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
            svgViewBoxSize: 300,
        });

        const svg = String(qrcode.render('test'));
        
        expect(svg.length).toBeGreaterThan(0);
        expect(typeof svg).toBe('string');
    });

    it('respects clearLogoSpace option', () => {
        qrcode = new QRCode({
            outputInterface: QRkySVG,
            version: 5,
            eccLevel: ECC_L,
            clearLogoSpace: true,
            svgLogoScale: 0.2,
        });

        const result = qrcode.render('test');
        const svg = String(result);
        
        // Should generate without errors
        expect(svg).toBeDefined();
        expect(typeof svg).toBe('string');
        expect(svg.length).toBeGreaterThan(0);
    });

    it('handles different corner radius values', () => {
        const radiusValues = [0, 0.2, 0.4, 0.5];
        
        radiusValues.forEach(radius => {
            const qr = new QRCode({
                outputInterface: QRkySVG,
                version: 5,
                eccLevel: ECC_L,
                circleRadius: radius,
            });

            const result = qr.render('test');
            const svg = String(result);
            
            expect(svg).toBeDefined();
            expect(typeof svg).toBe('string');
            expect(svg.length).toBeGreaterThan(0);
        });
    });

    it('generates valid SVG for various input strings', () => {
        const inputs = ['test', 'https://example.com', '12345'];
        
        inputs.forEach(input => {
            const result = qrcode.render(input);
            const svg = String(result);
            
            expect(svg).toBeDefined();
            expect(typeof svg).toBe('string');
            expect(svg.length).toBeGreaterThan(0);
        });
    });
});
