import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditAliasForm } from './components/form/alias-form';

interface EditAliasPageProps {
    params: Promise<{ uuid: string }>;
}

export default async function EditAliasPage({ params }: EditAliasPageProps) {
    const { uuid } = await params;

    const supabase = await createClient();

    // Fetch URL by UUID
    const { data: url, error: urlError } = await supabase.from('url_objects')
        .select('id, url')
        .eq('uuid', uuid)
        .maybeSingle();

    if (urlError || !url) {
        notFound();
    }
    
    // Fetch the ONE alias for this URL (by url_object_id)
    const { data: aliasData, error: aliasError } = await supabase
        .from('aliases')
        .select('id, value')
        .eq('url_object_id', url.id)
        .maybeSingle();

    if (aliasError || !aliasData) {
        notFound();
    }

    return (
        <EditAliasForm
            aliasId={aliasData.id}
            currentAlias={aliasData.value}
            url={url.url}
        />
    );
}
