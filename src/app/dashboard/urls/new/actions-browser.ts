import {createClient} from "@/lib/supabase/browser";
import {STRING_TABLE_NAME_URL_OBJECTS} from "@/app/dashboard/urls/constants";
import {stringIsValid} from "@/lib/strings";
import {redirect, RedirectType} from "next/navigation";

export async function createUrl(formData: FormData): Promise<void> {
    const url = formData.get("url");

    if (
        !stringIsValid(url) ||
        (!url.startsWith("https://") && !url.startsWith("http://"))
    ) {
        throw new Error("Invalid URL");
    }

    const supabase = createClient();
    const { error } = await supabase.from(STRING_TABLE_NAME_URL_OBJECTS)
        .insert({
            url: url,
        });

    if (error) {
        console.error(error.message);
        throw error;
    }

    redirect("/dashboard/urls", RedirectType.push);
}