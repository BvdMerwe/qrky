import {createClient} from "@/lib/server-client";
import redirectUser from "@/lib/redirectUser";

export default async function Page({
    params
}:{
    params: Promise<{ slug: string}>
}): Promise<void> {
    const { slug } = await params;
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("aliases")
        .select(`
            id,
            value,
            url_objects (url, enabled)
        `)
        .eq('value', slug)
        .eq('url_objects.enabled', true)
        .maybeSingle();


    // @ts-expect-error -- Supabase not correctly creating the types.
    await redirectUser(data?.url_objects?.url ?? null, error, "aliases", data?.id);
}
