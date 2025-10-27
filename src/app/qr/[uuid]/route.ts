import {ECC_H, QRCode} from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import {DOMParser} from '@xmldom/xmldom';
import {QRkyOptions, QRkySVG} from '@/lib/qrcode';
import sharp from "sharp";
import {createClient} from "@/lib/supabase/server";
import {notFound, redirect, RedirectType} from "next/navigation";
import {NextRequest} from "next/server";
import path from "node:path";

const LOGO_PATH = path.join(process.cwd(), 'public', 'qrky-logo.svg');
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Polyfill DOMParser for Node.js environment
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
    const supabase = await createClient();
    const {count: qrCodeCount, error} = await supabase
        .from("qr_codes")
        .select(`
            id,
            url_objects(enabled)
        `, { count: 'exact', head: true })
        .eq('url_objects.enabled', true)
        .eq('id', uuid);

    if (error) {
        console.error(error, qrCodeCount);
        return redirect('/500', RedirectType.push);
    } else if (qrCodeCount === 0) {
        notFound();
    }

    const url = buildQrCodeUrl(uuid);

    // Return the PNG buffer directly (not as string)
    return new Response(await generateQrCode(url) as BodyInit, {
        headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000, immutable',
        }
    });
}

async function generateQrCode(data: string): Promise<Uint8Array> {
    try {
    // Use QRkyOptions with QRkySVG for custom rounded module shapes
        const options = new QRkyOptions({
            addQuietzone: true,
            quietzoneSize: 2,
            bgColor: "#ffffff",
            versionMin: 5,
            eccLevel: ECC_H,
            outputInterface: QRkySVG,
            drawLightModules: true,
            circleRadius: 0.45,        // Adjust roundness (0-0.5)
            svgLogo: LOGO_PATH,             // Optional: '/path/to/logo.svg'
            clearLogoSpace: false,      // Clear space for logo
            svgLogoScale: 0.35,        // Logo scale (10-30% recommended)
            svgLogoScaleMinimum: 0.1,  // Minimum 10%
            svgLogoScaleMaximum: 0.3,  // Maximum 30%
            svgLogoCssClass: 'qr-logo',
            svgViewBoxSize: 1080,
            outputBase64: false,
            returnAsDomElement: false,
        });

        const qrcode: string = (new QRCode(options)).render(data);
        const svgBuffer = Buffer.from(qrcode, 'utf-8');

        return sharp(svgBuffer)
            .jpeg({
                quality: 100,
                // compressionLevel: 4,
            })
            .toBuffer();
    } catch (e: unknown) {
        console.error(e);
        redirect("/500", RedirectType.push);
    }
}

function buildQrCodeUrl(data: string): string{
    return `${APP_URL}/q/${data}`;
}