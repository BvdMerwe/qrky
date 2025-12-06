import {createClient} from "@/lib/supabase/browser";
import {STRING_TABLE_NAME_URL_OBJECTS} from "@/app/dashboard/urls/constants";
import {stringIsValidUrl} from "@/lib/strings";
import {redirect, RedirectType} from "next/navigation";

export async function updateUrl(formData: FormData): Promise<void> {
    const url = formData.get("url");
    const uuid = formData.get("uuid");

    if (!stringIsValidUrl(url)) {
        throw new Error("Invalid URL");
    }

    console.log(url, uuid);

    const supabase = createClient();
    const { error } = await supabase.from(STRING_TABLE_NAME_URL_OBJECTS)
        .update({
            url: url,
        })
        .eq("uuid", uuid);

    if (error) {
        console.error(error.message);
        throw error;
    }

    redirect("/dashboard/urls", RedirectType.push);
}