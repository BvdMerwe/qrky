import {PostgrestError} from "@supabase/supabase-js";
import {redirect, RedirectType} from "next/navigation";
import recordView from "@/lib/record-view";
import {headers} from "next/headers";

export default async function redirectUser(
    url: string | null,
    error: PostgrestError | null,
    source: "qr_codes"|"aliases"|"url_objects",
    identifier: string,
): Promise<void> {
    if (error) {
        console.error((error as Error).message);
        redirect('/500', RedirectType.push);
    } else if (url === null) {
        // redirect to 404
        redirect('/404', RedirectType.push);
    } else {
        // record view and redirect to actual URL
        await recordView(await headers(), source, identifier);
        // redirect(url, RedirectType.replace);
    }
}