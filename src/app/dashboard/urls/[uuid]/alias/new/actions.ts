'use server';

import { createClient } from '@/lib/supabase/server';
import { stringIsValid } from '@/lib/strings';
import { validateAlias } from '@/lib/validation';
import { redirect, RedirectType } from 'next/navigation';
import { ActionResponseInterface } from '@/interfaces/action-response';

export async function createAlias(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const uuid = formData.get('uuid');
    const alias = formData.get('alias');

    if (!stringIsValid(uuid) || !stringIsValid(alias)) {
        return { message: 'Invalid input', success: false };
    }

    const normalizedAlias = alias.toLowerCase().trim();

    try {
        validateAlias(normalizedAlias);
    } catch (e) {
        return { message: (e as Error).message, success: false };
    }

    const supabase = await createClient();

    const { data: urlObject, error: urlError } = await supabase
        .from('url_objects')
        .select('id')
        .eq('uuid', uuid)
        .single();

    if (urlError || !urlObject) {
        return { message: 'URL not found', success: false };
    }

    const { data: existingAlias, error: aliasCheckError } = await supabase
        .from('aliases')
        .select('id, value')
        .eq('value', normalizedAlias)
        .maybeSingle();

    if (aliasCheckError) {
        return { message: 'Failed to check alias availability', success: false };
    }

    if (existingAlias) {
        return { message: 'Alias already exists', success: false };
    }

    const { error } = await supabase
        .from('aliases')
        .insert({
            value: normalizedAlias,
            url_object_id: urlObject.id,
        });

    if (error) {
        console.error(error.message);
        return { message: error.message, success: false };
    }

    redirect('/dashboard/urls', RedirectType.push);
}
