import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditAliasForm } from "./components/form/alias-form";

interface EditAliasPageProps {
    params: Promise<{ uuid: string }>;
    searchParams: Promise<{ aliasId?: string }>;
}

export default async function EditAliasPage({ params, searchParams }: EditAliasPageProps) {
    const { uuid } = await params;
    const { aliasId } = await searchParams;

    if (!aliasId) {
        notFound();
    }

    const supabase = await createClient();

    const { data: aliasData, error: aliasError } = await supabase
        .from("aliases")
        .select("id, value, url_object_id")
        .eq("id", parseInt(aliasId))
        .single();

    if (aliasError || !aliasData) {
        notFound();
    }

    const { data: urlData, error: urlError } = await supabase
        .from("url_objects")
        .select("id, uuid, url")
        .eq("uuid", uuid)
        .eq("id", aliasData.url_object_id)
        .single();

    if (urlError || !urlData) {
        notFound();
    }

    return (
        <EditAliasForm
            aliasId={aliasId}
            currentAlias={aliasData.value}
            url={urlData.url}
        />
    );
}
