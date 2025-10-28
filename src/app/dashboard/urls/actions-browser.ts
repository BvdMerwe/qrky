import {UrlObject} from "@/types/db/url-object";
import {createClient} from "@/lib/supabase/browser";
import {STRING_TABLE_NAME_URL_OBJECTS} from "@/app/dashboard/urls/constants";
import {fetchUrls} from "@/app/dashboard/urls/actions";

export async function toggleEnabled(uuid: string): Promise<UrlObject[]> {
    const supabase = createClient();
    const { data: urlCurrent, error: urlError } = await supabase
        .from(STRING_TABLE_NAME_URL_OBJECTS)
        .select("id, enabled")
        .eq("uuid", uuid)
        .maybeSingle();

    if (urlError || urlCurrent === null) {
        throw new Error(`URL object ${uuid} not found.`);
    }

    const { data: urls, error } = await supabase
        .from(STRING_TABLE_NAME_URL_OBJECTS)
        .update({
            enabled: !urlCurrent.enabled
        })
        .select("*")
        .eq("id", urlCurrent.id)

    if (error) {
        throw error;
    }

    return urls;
}

export async function deleteUrl(uuid: string): Promise<void> {
    const supabase = createClient();
    const { error: urlError } = await supabase
        .from(STRING_TABLE_NAME_URL_OBJECTS)
        .delete()
        .eq("uuid", uuid);

    if (urlError) {
        throw urlError;
    }
}

export async function fetchUrlsBrowser(): Promise<UrlObject[]> {
    const supabase = createClient();
    return fetchUrls(supabase)
}