import { NextRequest, NextResponse } from 'next/server';
import { generateQrCode } from '@/lib/qrcode/generate';

const DEFAULT_FG_COLOR = '#000000';
const DEFAULT_BG_COLOR = '#ffffff';
const DEFAULT_CORNER_RADIUS = 0.45;
const DEFAULT_LOGO_SCALE = 0.2;

const ALLOWED_LOGO_VALUES = ['default', ''];

function isAllowedLogoUrl(url: string | null): boolean {
    if (!url) return true;
    
    if (ALLOWED_LOGO_VALUES.includes(url.toLowerCase())) {
        return true;
    }
    
    const supabaseStoragePattern = /^http(s)?:\/\/[^/]+\/storage\/v1\/object\/public\/qr-logos\//i;
    if (supabaseStoragePattern.test(url)) {
        return true;
    }
    
    return false;
}

/**
 * Generate a preview QR code.
 * @param request {
 *  data = the QR code data
 *  fg = the foreground color (filled modules)
 *  bg = the background color (empty modules)
 *  cr = corner radius of modules
 *  ls = the scale of the logo from 0 to 1
 *  logo = the URL of the logo (must be a valid internal image)
 * }
 * @constructor
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    
    const data = searchParams.get('data');
    const fgColor = searchParams.get('fg') || DEFAULT_FG_COLOR;
    const bgColor = searchParams.get('bg') || DEFAULT_BG_COLOR;
    const cornerRadius = parseFloat(searchParams.get('cr') || '') || DEFAULT_CORNER_RADIUS;
    const logoScale = parseFloat(searchParams.get('ls') || '') || DEFAULT_LOGO_SCALE;
    const logoUrl = searchParams.get('logo');
    const logoClearSpace = searchParams.get('cls') === '1';

    if (!data) {
        return NextResponse.json(
            { error: 'Missing required parameter: data' },
            { status: 400 }
        );
    }
    
    if (!isAllowedLogoUrl(logoUrl)) {
        return NextResponse.json(
            { error: 'Invalid logoUrl. Must be "default", empty, or a Supabase Storage URL from qr-logos bucket.' },
            { status: 400 }
        );
    }

    let processedLogoUrl: string | null = null;

    if (logoUrl && logoUrl.toLowerCase() !== 'default' && logoUrl !== '') {
        processedLogoUrl = logoUrl;
    }

    const result = await generateQrCode({
        data,
        fgColor,
        bgColor,
        cornerRadius,
        logoUrl: processedLogoUrl,
        logoClearSpace,
        logoScale,
    });

    return new NextResponse(result.svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}
