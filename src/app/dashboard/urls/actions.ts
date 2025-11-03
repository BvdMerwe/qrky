import {SupabaseClient} from "@supabase/supabase-js";
import {UrlObject} from "@/types/db/url-object";
import {STRING_TABLE_NAME_URL_OBJECTS} from "@/app/dashboard/urls/constants";

export async function fetchUrls(supabase: SupabaseClient): Promise<UrlObject[]> {
    const { data: urls, error } = await supabase
        .from(STRING_TABLE_NAME_URL_OBJECTS)
        .select(`
            *,
            aliases ( * ),
            qr_codes ( * )
        `)
        .order("id", {ascending: false});

    if (error) {
        throw error;
    }

    return urls;
}