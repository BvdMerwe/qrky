import {ECC_H, QRCode} from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import {DOMParser} from '@xmldom/xmldom';
import {QRkyOptions, QRkySVG} from '@/lib/qrcode';
import sharp from "sharp";
import {createClient} from "@/lib/supabase/server";
import {notFound, redirect, RedirectType} from "next/navigation";
import {NextRequest} from "next/server";
import path from "node:path";
import fs from "node:fs";

const LOGO_PATH = path.join(process.cwd(), 'public', 'qrky-logo.svg');
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const DEFAULT_FG_COLOR = '#000000';
const DEFAULT_BG_COLOR = '#ffffff';
const DEFAULT_CORNER_RADIUS = 0.45;
const DEFAULT_LOGO_SCALE = 0.2;

interface QrCodeSettings {
    fgColor: string | null;
    bgColor: string | null;
    cornerRadius: number | null;
    logoUrl: string | null;
    logoScale: number | null;
}

if (typeof globalThis.DOMParser === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Need to use any for polyfill.
    (globalThis as any).DOMParser = DOMParser;
}

export async function GET(request: NextRequest, {
  params,
}: {
    params: Promise<{ uuid: string }>
}) {
    const { uuid } = await params;
    const { searchParams } = new URL(request.url);
    
    const previewMode = searchParams.get('preview') === 'true';
    const supabase = await createClient();
    
    const { data: qrCodeData, error: qrCodeError } = await supabase
        .from("qr_codes")
        .select(`
            id,
            settings,
            url_objects(enabled)
        `)
        .eq('id', uuid)
        .single();

    if (qrCodeError || !qrCodeData) {
        console.error(qrCodeError);
        return redirect('/500', RedirectType.push);
    }

    const urlObjects = qrCodeData.url_objects as { enabled: boolean }[] | null;
    if (!previewMode && (!urlObjects || urlObjects.length === 0 || !urlObjects[0]?.enabled)) {
        notFound();
    }

    const savedSettings = qrCodeData.settings as QrCodeSettings | null;
    
    let fgColor: string;
    let bgColor: string;
    let cornerRadius: number;
    let logoScale: number;
    let logoUrl: string | undefined;
    
    if (previewMode) {
        fgColor = searchParams.get('fg') ? `#${searchParams.get('fg')}` : (savedSettings?.fgColor || DEFAULT_FG_COLOR);
        bgColor = searchParams.get('bg') ? `#${searchParams.get('bg')}` : (savedSettings?.bgColor || DEFAULT_BG_COLOR);
        cornerRadius = parseFloat(searchParams.get('cr') || '') || (savedSettings?.cornerRadius ?? DEFAULT_CORNER_RADIUS);
        logoScale = parseFloat(searchParams.get('ls') || '') || (savedSettings?.logoScale ?? DEFAULT_LOGO_SCALE);
        logoUrl = searchParams.get('logo') || (savedSettings?.logoUrl || undefined);
    } else {
        fgColor = savedSettings?.fgColor || DEFAULT_FG_COLOR;
        bgColor = savedSettings?.bgColor || DEFAULT_BG_COLOR;
        cornerRadius = savedSettings?.cornerRadius ?? DEFAULT_CORNER_RADIUS;
        logoScale = savedSettings?.logoScale ?? DEFAULT_LOGO_SCALE;
        logoUrl = savedSettings?.logoUrl || undefined;
    }

    const url = buildQrCodeUrl(uuid);

    return new Response(await generateQrCode(url, {
        fgColor,
        bgColor,
        cornerRadius,
        logoScale,
        logoUrl,
    }) as BodyInit, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': previewMode ? 'no-cache, no-store' : 'public, max-age=31536000, immutable',
        }
    });
}

async function generateQrCode(data: string, options?: {
    fgColor?: string;
    bgColor?: string;
    cornerRadius?: number;
    logoScale?: number;
    logoUrl?: string;
}): Promise<Uint8Array> {
    try {
        let logoBuffer: Buffer | null = null;
        
        if (options?.logoUrl) {
            try {
                const response = await fetch(options.logoUrl);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    logoBuffer = Buffer.from(arrayBuffer);
                }
            } catch {
                console.warn('Failed to fetch logo, proceeding without logo');
            }
        } else if (fs.existsSync(LOGO_PATH)) {
            logoBuffer = fs.readFileSync(LOGO_PATH);
        }

        const qrOptions = new QRkyOptions({
            addQuietzone: true,
            quietzoneSize: 2,
            bgColor: options?.bgColor || DEFAULT_BG_COLOR,
            color: options?.fgColor || DEFAULT_FG_COLOR,
            versionMin: 5,
            eccLevel: ECC_H,
            outputInterface: QRkySVG,
            drawLightModules: true,
            circleRadius: options?.cornerRadius || DEFAULT_CORNER_RADIUS,
            svgLogoBuffer: logoBuffer,
            clearLogoSpace: logoBuffer !== null,
            svgLogoScale: options?.logoScale || DEFAULT_LOGO_SCALE,
            svgLogoScaleMinimum: 0.1,
            svgLogoScaleMaximum: 0.3,
            svgLogoCssClass: 'qr-logo',
            svgViewBoxSize: 1080,
            outputBase64: false,
            returnAsDomElement: false,
        });

        const qrcode: string = (new QRCode(qrOptions)).render(data);
        const svgBuffer = Buffer.from(qrcode, 'utf-8');

        return sharp(svgBuffer)
            .jpeg({
                quality: 100,
            })
            .toBuffer();
    } catch (e: unknown) {
        console.error(e);
        redirect("/500", RedirectType.push);
    }
}

function buildQrCodeUrl(data: string): string{
    return `${NEXT_PUBLIC_APP_URL}/q/${data}`;
}