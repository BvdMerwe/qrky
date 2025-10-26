/* eslint-disable @typescript-eslint/no-explicit-any -- Library types */

declare module '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs' {
    // Error Correction Level constants
    export const ECC_L: number; // 7% error correction
    export const ECC_M: number; // 15% error correction
    export const ECC_Q: number; // 25% error correction
    export const ECC_H: number; // 30% error correction

    // Mask Pattern constants
    export const MASK_PATTERN_AUTO: number;
    export const PATTERN_000: number;
    export const PATTERN_001: number;
    export const PATTERN_010: number;
    export const PATTERN_011: number;
    export const PATTERN_100: number;
    export const PATTERN_101: number;
    export const PATTERN_110: number;
    export const PATTERN_111: number;

    // Version constants
    export const VERSION_AUTO: number;

    // Mode constants
    export const MODE_NUMBER: number;
    export const MODE_ALPHANUM: number;
    export const MODE_BYTE: number;
    export const MODES: number[];

    // Matrix module type constants
    export const M_NULL: number;
    export const M_DATA: number;
    export const M_DATA_DARK: number;
    export const M_FINDER: number;
    export const M_FINDER_DARK: number;
    export const M_FINDER_DOT: number;
    export const M_FINDER_DOT_LIGHT: number;
    export const M_SEPARATOR: number;
    export const M_SEPARATOR_DARK: number;
    export const M_ALIGNMENT: number;
    export const M_ALIGNMENT_DARK: number;
    export const M_TIMING: number;
    export const M_TIMING_DARK: number;
    export const M_FORMAT: number;
    export const M_FORMAT_DARK: number;
    export const M_VERSION: number;
    export const M_VERSION_DARK: number;
    export const M_DARKMODULE: number;
    export const M_DARKMODULE_LIGHT: number;
    export const M_QUIETZONE: number;
    export const M_QUIETZONE_DARK: number;
    export const M_LOGO: number;
    export const M_LOGO_DARK: number;

    export const IS_DARK: boolean;
    export const DEFAULT_MODULE_VALUES: Record<number, number>;
    export const LAYERNAMES: string[];
    export const MATRIX_NEIGHBOURS: number[][];
    export const MATRIX_NEIGHBOUR_FLAGS: Record<string, number>;
    export const PATTERNS: number[];

    // QR Options interface
    export interface QROptionsInterface {
        version?: number;
        versionMin?: number;
        versionMax?: number;
        eccLevel?: number;
        maskPattern?: number;
        addQuietzone?: boolean;
        quietzoneSize?: number;
        outputInterface?: any;
        outputType?: string;
        cachefile?: string | null;
        addLogoSpace?: boolean;
        logoSpaceWidth?: number;
        logoSpaceHeight?: number;
        logoSpaceStartX?: number;
        logoSpaceStartY?: number;
        returnAsDomElement?: boolean;
        drawLightModules?: boolean;
        circleRadius?: number;
        svgLogo?: string | null;
        clearLogoSpace?: boolean;
        connectPaths?: boolean;
        svgConnectPaths?: boolean;
        svgLogoScale?: number;
        svgLogoCssClass?: string;
        svgViewBoxSize?: number;
        outputBase64?: boolean;
        svgAddXmlHeader?: boolean;
        eol?: string;
        [key: string]: any;
    }

    // QR Options class
    export class QROptions implements QROptionsInterface {
        version?: number;
        versionMin?: number;
        versionMax?: number;
        eccLevel?: number;
        maskPattern?: number;
        addQuietzone?: boolean;
        quietzoneSize?: number;
        outputInterface?: any;
        outputType?: string;
        cachefile?: string | null;
        addLogoSpace?: boolean;
        logoSpaceWidth?: number;
        logoSpaceHeight?: number;
        logoSpaceStartX?: number;
        logoSpaceStartY?: number;
        returnAsDomElement?: boolean;
        [key: string]: any;

        constructor(options?: QROptionsInterface);
    }

    // Main QRCode class
    export class QRCode {
        protected options: QROptions;
        protected dataSegments: any[];

        constructor(options?: QROptions | QROptionsInterface);

        /**
         * Renders a QR Code for the given data and QROptions
         */
        render(data?: string | null, file?: string | null): string | HTMLCanvasElement | any;

        /**
         * Renders a QR Code for the given QRMatrix and QROptions
         */
        renderMatrix(matrix: QRMatrix, file?: string | null): string | HTMLCanvasElement | any;

        /**
         * Returns a QRMatrix object for the given data and current QROptions
         */
        getQRMatrix(): QRMatrix;

        /**
         * Adds a data segment
         */
        addSegment(segment: any): QRCode;

        /**
         * Clears the data segments array
         */
        clearSegments(): QRCode;

        /**
         * Adds a numeric data segment
         */
        addNumericSegment(data: string): QRCode;

        /**
         * Adds an alphanumeric data segment
         */
        addAlphaNumSegment(data: string): QRCode;

        /**
         * Adds an 8-bit byte data segment
         */
        addByteSegment(data: string | Uint8Array): QRCode;
    }

    // QR Matrix class
    export class QRMatrix {
        getSize(): number;
        check(x: number, y: number): boolean;
        setLogoSpace(width: number, height: number, startX?: number, startY?: number): QRMatrix;
        setQuietZone(size: number): QRMatrix;
        setFormatInfo(maskPattern: MaskPattern): QRMatrix;
        mask(maskPattern: MaskPattern): QRMatrix;
    }

    // Data mode classes
    export class Numeric {
        constructor(data: string);
        static validateString(data: string): boolean;
    }

    export class AlphaNum {
        constructor(data: string);
        static validateString(data: string): boolean;
    }

    export class Byte {
        constructor(data: string | Uint8Array);
        static validateString(data: string): boolean;
    }

    // Utility classes
    export class MaskPattern {
        constructor(pattern: number);
        static getBestPattern(matrix: QRMatrix): MaskPattern;
    }

    export class EccLevel {
        static isValid(level: number): boolean;
    }

    export class Version {
        static isValid(version: number): boolean;
    }

    export class Mode {
        static isValid(mode: number): boolean;
    }

    export class BitBuffer {
        constructor();
        put(num: number, length: number): void;
        getLengthInBits(): number;
        get(index: number): boolean;
    }

    // Data class
    export class QRData {
        constructor(options: QROptions, dataSegments: any[]);
        writeMatrix(): QRMatrix;
    }

    // Output interfaces and classes
    export class QROutputInterface {
        dump(file?: string | null): any;
    }

    export class QROutputAbstract extends QROutputInterface {
        protected moduleCount: number;
        protected options: QROptionsInterface;
        protected matrix: QRMatrix;
        mimeType: string;
    }

    export class QRCanvas extends QROutputAbstract {
        mimeType: 'image/png';
    }

    export class QRMarkupSVG extends QROutputAbstract {
        mimeType: 'image/svg+xml';
        protected header(): string;
        protected paths(): string;
        protected module(x: number, y: number, M_TYPE: number): string;
    }

    export class QRStringText extends QROutputAbstract {
        mimeType: 'text/plain';
    }

    export class QRStringJSON extends QROutputAbstract {
        mimeType: 'application/json';
    }

    // Data mode interface
    export class QRDataModeInterface {
        static validateString(data: string): boolean;
    }

    // Exceptions
    export class QRCodeException extends Error {
        constructor(message?: string);
    }

    export class QRCodeDataException extends QRCodeException {
        constructor(message?: string);
    }

    export class QRCodeOutputException extends QRCodeException {
        constructor(message?: string);
    }
}