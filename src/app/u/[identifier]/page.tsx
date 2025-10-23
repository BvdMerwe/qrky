import {createClient} from "@/lib/server-client";
import redirectUser from "@/lib/redirectUser";

export default async function Page({
   params
}:{
    params: Promise<{ identifier: string}>
}): Promise<void> {
    const { identifier } = await params;
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("url_objects")
        .select("id, url")
        .eq('identifier', identifier)
        .eq('enabled', true)
        .maybeSingle();

    await redirectUser(data?.url ?? null, error, "url_objects", data?.id);
}