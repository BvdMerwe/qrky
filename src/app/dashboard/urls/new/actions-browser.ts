import { createClient } from '@/lib/supabase/browser';
import { STRING_TABLE_NAME_URL_OBJECTS } from '@/app/dashboard/urls/constants';
import { stringIsValid } from '@/lib/strings';
import { validateAlias, normalizeAlias } from '@/lib/validation';
import { redirect, RedirectType } from 'next/navigation';

export async function createUrl(formData: FormData): Promise<void> {
    const url = formData.get('url');
    const alias = formData.get('alias');

    if (
        !stringIsValid(url) ||
        (!url.startsWith('https://') && !url.startsWith('http://'))
    ) {
        throw new Error('Invalid URL');
    }

    const supabase = createClient();
    const { data, error } = await supabase.from(STRING_TABLE_NAME_URL_OBJECTS)
        .insert({
            url: url,
        })
        .select('id')
        .single();

    if (error) {
        console.error(error.message);
        throw error;
    }

    if (stringIsValid(alias)) {
        const normalizedAlias = normalizeAlias(alias);

        validateAlias(normalizedAlias);

        const { data: existingAlias } = await supabase
            .from('aliases')
            .select('id, value')
            .eq('value', normalizedAlias)
            .maybeSingle();

        if (existingAlias) {
            throw new Error('Alias already exists');
        }

        const { error: aliasError } = await supabase
            .from('aliases')
            .insert({
                value: normalizedAlias,
                url_object_id: data.id,
            });

        if (aliasError) {
            console.error(aliasError.message);
            throw aliasError;
        }
    }

    redirect('/dashboard/urls', RedirectType.push);
}