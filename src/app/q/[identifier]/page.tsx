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
        .from("qr_codes")
        .select("id, url_objects (url, enabled)")
        .eq('id', identifier)
        .eq('url_objects.enabled', true)

        .maybeSingle();
    await redirectUser(data?.url_objects?.url ?? null, error, "qr_codes", data?.id);
}