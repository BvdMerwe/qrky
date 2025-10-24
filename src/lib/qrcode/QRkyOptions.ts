/**
 * Class QRkyOptions
 *
 * TypeScript port of NovaQRCodeOptions
 * Extended QR code options with SVG logo support and customization
 */

import {QRCodeException, QROptions, QROptionsInterface} from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import {accessSync, constants, existsSync} from 'fs';

export interface QRkyOptionsInterface extends QROptionsInterface {
    svgLogo?: string | null;
    svgViewBoxSize?: number;
    svgLogoScale?: number;
    svgLogoScaleMinimum?: number;
    svgLogoScaleMaximum?: number;
    svgLogoCssClass?: string;
    clearLogoSpace?: boolean;
}

export class QRkyOptions extends QROptions implements QRkyOptionsInterface {
    /** Path to SVG logo file */
    svgLogo: string | null = null;

    /** The scale of the SVG viewBox */
    svgViewBoxSize: number = 300;

    /** Logo scale as a percentage of QR Code size (0-1) */
    svgLogoScale: number = 0.20;

    /** Minimum logo scale (0 = 0%) */
    svgLogoScaleMinimum: number = 0;

    /** Maximum logo scale (1 = 100%) */
    svgLogoScaleMaximum: number = 1;

    /** CSS class for the logo (defined in svgDefs) */
    svgLogoCssClass: string = '';

    /** Whether to clear the logo space in the QR code */
    clearLogoSpace: boolean = true;

    constructor(options?: QRkyOptionsInterface) {
        super(options);

        if (options) {
            // Apply all options
            Object.keys(options).forEach(key => {
                const value = options[key];
                if (value !== undefined) {
                    // Use setter methods if they exist
                    const setterName = `set_${key}`;
                    if (typeof (this as any)[setterName] === 'function') {
                        (this as any)[setterName](value);
                    } else {
                        (this as any)[key] = value;
                    }
                }
            });
        }
    }

    /**
     * Validate and set the SVG logo path
     * @throws QRCodeException if logo file is invalid
     */
    protected set_svgLogo(svgLogo: string | null | undefined): void {
        if (!svgLogo || svgLogo.trim() === '') {
            this.svgLogo = null;
            return;
        }

        // Check if file exists
        if (!existsSync(svgLogo)) {
            throw new QRCodeException('invalid svg logo: file does not exist');
        }

        // Check if file is readable
        try {
            accessSync(svgLogo, constants.R_OK);
        } catch (error) {
            throw new QRCodeException('invalid svg logo: file is not readable: ' + error);
        }

        // @todo: validate SVG content
        this.svgLogo = svgLogo;
    }

    /**
     * Clamp logo scale to valid range
     */
    protected set_svgLogoScale(svgLogoScale: number): void {
        this.svgLogoScale = Math.max(
            this.svgLogoScaleMinimum,
            Math.min(this.svgLogoScaleMaximum, svgLogoScale)
        );
    }

    /**
     * Set minimum logo scale
     */
    protected set_svgLogoScaleMinimum(svgLogoScaleMinimum: number): void {
        this.svgLogoScaleMinimum = Math.max(0, Math.min(1, svgLogoScaleMinimum));
    }

    /**
     * Set maximum logo scale
     */
    protected set_svgLogoScaleMaximum(svgLogoScaleMaximum: number): void {
        this.svgLogoScaleMaximum = Math.max(0, Math.min(1, svgLogoScaleMaximum));
    }

    /**
     * Set SVG viewBox size
     */
    protected set_svgViewBoxSize(svgViewBoxSize: number): void {
        this.svgViewBoxSize = Math.max(1, svgViewBoxSize);
    }

    /**
     * Set clear logo space flag
     */
    protected set_clearLogoSpace(clearLogoSpace: boolean): void {
        this.clearLogoSpace = clearLogoSpace;
    }

    /**
     * Set SVG logo CSS class
     */
    protected set_svgLogoCssClass(svgLogoCssClass: string): void {
        this.svgLogoCssClass = svgLogoCssClass;
    }
}
