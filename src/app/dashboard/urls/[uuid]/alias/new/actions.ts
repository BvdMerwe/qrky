import {createClient} from "@/lib/supabase/browser";
import {stringIsValid} from "@/lib/strings";
import {redirect, RedirectType} from "next/navigation";

export async function createAlias(formData: FormData): Promise<void> {
    const uuid = formData.get("uuid");
    const alias = formData.get("alias");

    if (!stringIsValid(uuid) || !stringIsValid(alias)) {
        throw new Error("Invalid input");
    }

    const supabase = createClient();

    const { data: urlObject, error: urlError } = await supabase
        .from("url_objects")
        .select("id")
        .eq("uuid", uuid)
        .single();

    if (urlError || !urlObject) {
        console.error(urlError?.message);
        throw new Error("URL not found");
    }

    const { error } = await supabase
        .from("aliases")
        .insert({
            value: alias,
            url_object_id: urlObject.id,
        });

    if (error) {
        console.error(error.message);
        throw error;
    }

    redirect("/dashboard/urls", RedirectType.push);
}
