'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { QrCodeSettings } from '@/types/db/qr-code';

const MAX_LOGO_SIZE = 500 * 1024; // 500KB
const ALLOWED_LOGO_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
const CORNER_RADIUS_MIN = 0;
const CORNER_RADIUS_MAX = 0.5;

function isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function validateCornerRadius(radius: number): boolean {
    return !isNaN(radius) && radius >= CORNER_RADIUS_MIN && radius <= CORNER_RADIUS_MAX;
}

export async function updateQrCode(formData: FormData): Promise<void> {
    const qrCodeId = formData.get('qr_code_id') as string;
    const fgColor = formData.get('fg_color') as string;
    const bgColor = formData.get('bg_color') as string;
    const cornerRadiusStr = formData.get('corner_radius') as string;
    const logoFile = formData.get('logo') as File | null;
    const clearLogo = formData.get('clear_logo') === 'true';
    const clearLogoSpace = formData.get('clear_logo_space') === 'true';

    if (!qrCodeId) {
        throw new Error('Invalid input: missing QR code ID');
    }

    // Validate colors
    if (fgColor && !isValidHexColor(fgColor)) {
        throw new Error('Invalid foreground color: must be valid hex (e.g., #000000)');
    }

    if (bgColor && !isValidHexColor(bgColor)) {
        throw new Error('Invalid background color: must be valid hex (e.g., #ffffff)');
    }

    // Validate corner radius
    const cornerRadius = cornerRadiusStr ? parseFloat(cornerRadiusStr) : null;
    if (cornerRadius !== null && cornerRadiusStr !== '' && !validateCornerRadius(cornerRadius)) {
        throw new Error(`Invalid corner radius: must be between ${CORNER_RADIUS_MIN} and ${CORNER_RADIUS_MAX}`);
    }

    // Validate logo file
    let logoUrl: string | null = null;
    if (logoFile && logoFile.size > 0) {
        if (logoFile.size > MAX_LOGO_SIZE) {
            throw new Error(`Invalid logo: file size must be less than ${MAX_LOGO_SIZE / 1024}KB`);
        }

        if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
            throw new Error('Invalid logo: only SVG, PNG, and JPG files are allowed');
        }
    }

    const supabase = await createClient();

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        console.error(userError?.message);
        throw new Error('Authentication required');
    }

    // Verify QR code exists and belongs to user's URL (fetch settings to preserve existing logoUrl)
    const { data: qrCode, error: fetchError } = await supabase
        .from('qr_codes')
        .select('id, url_object_id, settings')
        .eq('id', qrCodeId)
        .single();

    if (fetchError || !qrCode) {
        console.error(fetchError?.message);
        throw new Error('QR code not found');
    }

    // Verify the URL belongs to the user
    const { data: urlObject, error: urlError } = await supabase
        .from('url_objects')
        .select('id, user_id')
        .eq('id', qrCode.url_object_id)
        .single();

    if (urlError || !urlObject) {
        console.error(urlError?.message);
        throw new Error('URL not found');
    }

    if (urlObject.user_id !== user.id) {
        throw new Error('Unauthorized');
    }

    // Upload logo if provided
    if (logoFile && logoFile.size > 0) {
        const arrayBuffer = await logoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileExtension = logoFile.name.split('.').pop() || 'bin';
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const storagePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('qr-logos')
            .upload(storagePath, buffer, {
                contentType: logoFile.type,
                upsert: false,
            });

        if (uploadError) {
            console.error(uploadError.message);
            throw new Error('Failed to upload logo');
        }

        const { data: urlData } = supabase.storage
            .from('qr-logos')
            .getPublicUrl(storagePath);

        logoUrl = urlData.publicUrl;
    }

    // Preserve existing logoUrl if no new logo was uploaded; null it out if clearLogo requested
    const existingLogoUrl = (qrCode.settings as QrCodeSettings | null)?.logoUrl ?? null;
    const resolvedLogoUrl = clearLogo ? null : (logoUrl ?? existingLogoUrl);

    // Build settings object
    const settings: QrCodeSettings = {
        fgColor: fgColor || null,
        bgColor: bgColor || null,
        cornerRadius: cornerRadius,
        logoUrl: resolvedLogoUrl,
        logoScale: formData.get('logo_scale') ? parseFloat(formData.get('logo_scale') as string) : null,
        clearLogoSpace: clearLogoSpace,
    };

    // Update QR code settings
    const { error: updateError } = await supabase
        .from('qr_codes')
        .update({ settings })
        .eq('id', qrCodeId);

    if (updateError) {
        console.error(updateError.message);
        throw new Error('Failed to update QR code settings');
    }

    revalidatePath('/dashboard/urls');
}
