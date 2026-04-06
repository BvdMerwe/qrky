import {SupabaseClient} from "@supabase/supabase-js";
import {UrlObject} from "@/types/db/url-object";
import {STRING_TABLE_NAME_URL_OBJECTS} from "@/app/dashboard/urls/constants";

export async function fetchUrls(supabase: SupabaseClient): Promise<UrlObject[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return [];
    }

    // Fetch URLs first
    const { data: urls, error: urlsError } = await supabase
        .from(STRING_TABLE_NAME_URL_OBJECTS)
        .select("*")
        .eq("user_id", user.id)
        .order("id", {ascending: false});

    if (urlsError) {
        throw urlsError;
    }

    if (!urls || urls.length === 0) {
        return [];
    }

    // Fetch all aliases and QR codes separately
    const urlIds = urls.map(url => url.id);
    
    const { data: aliases } = await supabase
        .from("aliases")
        .select("*")
        .in("url_object_id", urlIds);
    
    const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("*")
        .in("url_object_id", urlIds);

    // Attach related data to each URL
    return urls.map(url => ({
        ...url,
        aliases: aliases?.filter(a => a.url_object_id === url.id) || [],
        qr_codes: qrCodes?.filter(q => q.url_object_id === url.id) || []
    }));
}