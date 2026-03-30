import { ECC_H, QRCode } from "@chillerlan/qrcode/dist/js-qrcode-node-src.cjs";
import { DOMParser } from "@xmldom/xmldom";
import {generateQrCode, QRkyOptions, QRkySVG} from "@/lib/qrcode";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect, RedirectType } from "next/navigation";
import { NextRequest } from "next/server";
import path from "node:path";
import fs from "node:fs";
import {buildQrCodeUrl} from "@/lib/qrcode/buildQrCodeUrl";

const LOGO_PATH = path.join(process.cwd(), "public", "qrky-logo.svg");

const DEFAULT_FG_COLOR = "#000000";
const DEFAULT_BG_COLOR = "#ffffff";
const DEFAULT_CORNER_RADIUS = 0.45;
const DEFAULT_LOGO_SCALE = 0.2;

interface QrCodeSettings {
    fgColor: string | null;
    bgColor: string | null;
    cornerRadius: number | null;
    logoUrl: string | null;
    logoScale: number | null;
    clearLogoSpace: boolean | null;
}

if (typeof globalThis.DOMParser === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Need to use any for polyfill.
    (globalThis as any).DOMParser = DOMParser;
}

export async function GET(request: NextRequest, {
    params,
}: {
    params: Promise<{ uuid: string }>;
}) {
    const { uuid } = await params;
    const { searchParams } = new URL(request.url);

    const previewMode = searchParams.get("preview") === "true";
    const supabase = await createClient();

    const query = supabase
        .from("qr_codes")
        .select(`
            id,
            settings,
            url_objects!inner(enabled)
        `)
        .eq("id", uuid)
        .single();

    const { data: qrCodeData, error: qrCodeError } = await query;

    if (qrCodeError || !qrCodeData) {
        console.error(qrCodeError);
        return redirect("/500", RedirectType.push);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase type inference doesn't handle embedded relations well
    const urlObjects = (qrCodeData as any).url_objects as { enabled: boolean } | null;
    if (
        !previewMode &&
        (!urlObjects || !urlObjects.enabled)
    ) {
        notFound();
    }

    const savedSettings = qrCodeData.settings as QrCodeSettings | null;

    let fgColor: string;
    let bgColor: string;
    let cornerRadius: number;
    let logoScale: number;
    let logoUrl: string | undefined;
    let logoClearSpace: boolean;

    if (previewMode) {
        fgColor = searchParams.get("fg")
            ? `#${searchParams.get("fg")}`
            : (savedSettings?.fgColor || DEFAULT_FG_COLOR);
        bgColor = searchParams.get("bg")
            ? `#${searchParams.get("bg")}`
            : (savedSettings?.bgColor || DEFAULT_BG_COLOR);
        cornerRadius = parseFloat(searchParams.get("cr") || "") ||
            (savedSettings?.cornerRadius ?? DEFAULT_CORNER_RADIUS);
        logoScale = parseFloat(searchParams.get("ls") || "") ||
            (savedSettings?.logoScale ?? DEFAULT_LOGO_SCALE);
        logoUrl = searchParams.get("logo") ||
            (savedSettings?.logoUrl || undefined);
        logoClearSpace = searchParams.get("cls") === "1" || (savedSettings?.clearLogoSpace ?? false);
    } else {
        fgColor = savedSettings?.fgColor || DEFAULT_FG_COLOR;
        bgColor = savedSettings?.bgColor || DEFAULT_BG_COLOR;
        cornerRadius = savedSettings?.cornerRadius ?? DEFAULT_CORNER_RADIUS;
        logoScale = savedSettings?.logoScale ?? DEFAULT_LOGO_SCALE;
        logoUrl = savedSettings?.logoUrl || undefined;
        logoClearSpace = savedSettings?.clearLogoSpace ?? false;
    }

    const url = buildQrCodeUrl(uuid);

    return new Response(
        await generateQrCodeResponse(url, {
            fgColor,
            bgColor,
            cornerRadius,
            logoScale,
            logoUrl,
            logoClearSpace,
        }) as BodyInit,
        {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": previewMode
                    ? "no-cache, no-store"
                    : "public, max-age=31536000, immutable",
            },
        },
    );
}

async function generateQrCodeResponse(data: string, options?: {
    fgColor?: string;
    bgColor?: string;
    cornerRadius?: number;
    logoScale?: number;
    logoUrl?: string;
    logoClearSpace?: boolean;
}): Promise<Uint8Array> {
    try {
        const qr = await generateQrCode({
            data,
            fgColor: options?.fgColor,
            bgColor: options?.bgColor,
            cornerRadius: options?.cornerRadius,
            logoUrl: options?.logoUrl || null,
            logoClearSpace: options?.logoClearSpace,
            logoScale: options?.logoScale,
        });

        const svgBuffer = qr.buffer;

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
