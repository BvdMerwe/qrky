'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect, RedirectType } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createQrCode(formData: FormData): Promise<void> {
    const uuid = formData.get('uuid') as string;

    if (!uuid) {
        throw new Error('Invalid input: missing URL UUID');
    }

    const supabase = await createClient();

    // Get the URL object ID
    const { data: urlObject, error: urlError } = await supabase
        .from('url_objects')
        .select('id')
        .eq('uuid', uuid)
        .single();

    if (urlError || !urlObject) {
        console.error(urlError?.message);
        throw new Error('URL not found');
    }

    // Create the QR code with default settings
    const { error } = await supabase
        .from('qr_codes')
        .insert({
            url_object_id: urlObject.id,
            settings: {},
        });

    if (error) {
        console.error(error.message);
        throw error;
    }

    revalidatePath('/dashboard/urls');
    redirect('/dashboard/urls', RedirectType.push);
}
