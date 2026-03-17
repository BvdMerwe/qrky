import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditAliasForm } from "./components/form/alias-form";

interface EditAliasPageProps {
    params: Promise<{ uuid: string }>;
    searchParams: Promise<{ aliasId?: string }>;
}

export default async function EditAliasPage({ params }: EditAliasPageProps) {
    const { uuid } = await params;

    const supabase = await createClient();

    // Fetch URL first
    const { data: url, error: urlError } = await supabase.from("url_objects")
        .select("id, url")
        .eq("uuid", uuid)
        .maybeSingle();

    if (urlError || !url) {
        notFound();
    }
    
    // Fetch Alias separately
    const { data: aliasData, error: aliasError } = await supabase
        .from("aliases")
        .select("id, value, url_object_id")
        .eq("url_object_id", url.id)
        .single()

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
