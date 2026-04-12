'use server';

import { createClient } from '@/lib/supabase/server';
import { stringIsValid } from '@/lib/strings';
import { normalizeAlias, validateAlias } from '@/lib/validation';
import { redirect, RedirectType } from 'next/navigation';
import { ActionResponseInterface } from '@/interfaces/action-response';

export async function updateAlias(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const aliasId = formData.get('aliasId');
    const alias = formData.get('alias');

    if (!stringIsValid(aliasId) || !stringIsValid(alias)) {
        return { message: 'Invalid input', success: false };
    }

    const normalizedAlias = normalizeAlias(alias);

    try {
        validateAlias(normalizedAlias);
    } catch (e) {
        return { message: (e as Error).message, success: false };
    }

    const supabase = await createClient();

    const { data: currentAlias, error: fetchError } = await supabase
        .from('aliases')
        .select('id, value, url_object_id')
        .eq('id', aliasId)
        .single();

    if (fetchError || !currentAlias) {
        return { message: 'Alias not found', success: false };
    }

    if (currentAlias.value === normalizedAlias) {
        redirect('/dashboard/urls', RedirectType.push);
    }

    const { data: existingAlias, error: aliasCheckError } = await supabase
        .from('aliases')
        .select('id, value')
        .eq('value', normalizedAlias)
        .neq('id', aliasId)
        .maybeSingle();

    if (aliasCheckError) {
        return { message: 'Failed to check alias availability', success: false };
    }

    if (existingAlias) {
        return { message: 'Alias already exists', success: false };
    }

    const { error } = await supabase
        .from('aliases')
        .update({ value: normalizedAlias })
        .eq('id', aliasId);

    if (error) {
        console.error(error.message);
        return { message: error.message, success: false };
    }

    redirect('/dashboard/urls', RedirectType.push);
}
