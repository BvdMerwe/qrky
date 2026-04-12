import { ECC_H, QRCode } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import { QRkyOptions, QRkySVG } from '@/lib/qrcode';
import path from 'node:path';

const DEFAULT_LOGO_PATH = path.join(process.cwd(), 'public', 'qrky-logo.svg');

export interface GenerateQrCodeOptions {
    data: string;
    fgColor?: string;
    bgColor?: string;
    cornerRadius?: number;
    logoUrl?: string | null;
    logoClearSpace?: boolean;
    logoScale?: number;
    size?: number;
    eccLevel?: number;
}

export interface GenerateQrCodeResult {
    svg: string;
    buffer: Buffer;
}

const DEFAULT_FG_COLOR = '#000000';
const DEFAULT_BG_COLOR = '#ffffff';
const DEFAULT_CORNER_RADIUS = 0.45;
const DEFAULT_LOGO_SCALE = 0.2;
const MIN_LOGO_SCALE = 0.1;
const MAX_LOGO_SCALE = 0.35;
const DEFAULT_SIZE = 1080;

export async function generateQrCode(options: GenerateQrCodeOptions): Promise<GenerateQrCodeResult> {
    const {
        data,
        fgColor = DEFAULT_FG_COLOR,
        bgColor = DEFAULT_BG_COLOR,
        cornerRadius = DEFAULT_CORNER_RADIUS,
        logoUrl = null,
        logoClearSpace = false,
        logoScale = DEFAULT_LOGO_SCALE,
        size = DEFAULT_SIZE,
        eccLevel = ECC_H,
    } = options;

    let logoBuffer: Buffer | null = null;

    if (logoUrl) {
        try {
            const response = await fetch(logoUrl, { signal: AbortSignal.timeout(5000) });
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                logoBuffer = Buffer.from(arrayBuffer);
            }
        } catch {
            // Fall back to default logo
        }
    }

    const clampedLogoScale = Math.max(MIN_LOGO_SCALE, Math.min(MAX_LOGO_SCALE, logoScale));

    const qrOptions = new QRkyOptions({
        addQuietzone: true,
        quietzoneSize: 2,
        bgColor: bgColor,
        color: fgColor,
        versionMin: 5,
        eccLevel: eccLevel,
        outputInterface: QRkySVG,
        drawLightModules: true,
        circleRadius: cornerRadius,
        customLogoBuffer: logoBuffer,
        svgLogo: DEFAULT_LOGO_PATH,
        clearLogoSpace: logoClearSpace,
        svgLogoScale: clampedLogoScale,
        svgLogoScaleMinimum: MIN_LOGO_SCALE,
        svgLogoScaleMaximum: MAX_LOGO_SCALE,
        svgLogoCssClass: 'qr-logo',
        svgViewBoxSize: size,
        outputBase64: false,
        returnAsDomElement: false,
    });

    const qrcode: string = new QRCode(qrOptions).render(data);
    const svgBuffer = Buffer.from(qrcode, 'utf-8');

    return {
        svg: qrcode,
        buffer: svgBuffer,
    };
}

export function validateLogoScale(scale: number): boolean {
    return scale >= MIN_LOGO_SCALE && scale <= MAX_LOGO_SCALE;
}

export function clampLogoScale(scale: number): number {
    return Math.max(MIN_LOGO_SCALE, Math.min(MAX_LOGO_SCALE, scale));
}
