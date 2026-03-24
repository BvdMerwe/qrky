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
    
    const supabaseStoragePattern = /^https:\/\/[^/]+\/storage\/v1\/object\/public\/qr-logos\//i;
    if (supabaseStoragePattern.test(url)) {
        return true;
    }
    
    return false;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    
    const data = searchParams.get('data');
    const fgColor = searchParams.get('fg') || DEFAULT_FG_COLOR;
    const bgColor = searchParams.get('bg') || DEFAULT_BG_COLOR;
    const cornerRadius = parseFloat(searchParams.get('cornerRadius') || '') || DEFAULT_CORNER_RADIUS;
    const logoScale = parseFloat(searchParams.get('logoScale') || '') || DEFAULT_LOGO_SCALE;
    const logoUrl = searchParams.get('logoUrl');
    
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
    
    let logoBuffer: Buffer | null = null;
    
    if (logoUrl && logoUrl.toLowerCase() !== 'default' && logoUrl !== '') {
        try {
            const response = await fetch(logoUrl);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                logoBuffer = Buffer.from(arrayBuffer);
            }
        } catch {
            console.warn('Failed to fetch logo for preview, proceeding without logo');
        }
    }
    
    const result = generateQrCode({
        data,
        fgColor,
        bgColor,
        cornerRadius,
        logoBuffer,
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
