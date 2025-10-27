import {createClient} from "@/lib/supabase/server";
import {ReadonlyHeaders} from "next/dist/server/web/spec-extension/adapters/headers";

export default async function recordView(headers: ReadonlyHeaders, objectType: "qr_codes"|"aliases"|"url_objects", identifier: string): Promise<void> {
    const supabase = await createClient();
    const ip = headers.get("x-forwarded-for") || headers.get("x-real-ip") || "";
    const userAgent = headers.get("user-agent") || "";

    await supabase.rpc('record_view', {
        objecttype: objectType,
        identifier,
        ip,
        useragent: userAgent
    });
}