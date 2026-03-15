import {createClient} from "@/lib/supabase/browser";
import {STRING_TABLE_NAME_URL_OBJECTS} from "@/app/dashboard/urls/constants";
import {stringIsValid} from "@/lib/strings";
import {redirect, RedirectType} from "next/navigation";

export async function createUrl(formData: FormData): Promise<void> {
    const url = formData.get("url");
    const alias = formData.get("alias");

    if (
        !stringIsValid(url) ||
        (!url.startsWith("https://") && !url.startsWith("http://"))
    ) {
        throw new Error("Invalid URL");
    }

    const supabase = createClient();
    const { data, error } = await supabase.from(STRING_TABLE_NAME_URL_OBJECTS)
        .insert({
            url: url,
        })
        .select("id")
        .single();

    if (error) {
        console.error(error.message);
        throw error;
    }

    if (stringIsValid(alias)) {
        const { error: aliasError } = await supabase
            .from("aliases")
            .insert({
                value: alias,
                url_object_id: data.id,
            });

        if (aliasError) {
            console.error(aliasError.message);
            throw aliasError;
        }
    }

    redirect("/dashboard/urls", RedirectType.push);
}