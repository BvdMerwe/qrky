"use server";

import { createClient } from "@/lib/supabase/server";
import { stringIsValid } from "@/lib/strings";
import { validateAlias, normalizeAlias } from "@/lib/validation";
import { redirect, RedirectType } from "next/navigation";

export async function updateAlias(formData: FormData): Promise<void> {
    const aliasId = formData.get("aliasId");
    const alias = formData.get("alias");

    if (!stringIsValid(aliasId) || !stringIsValid(alias)) {
        throw new Error("Invalid input");
    }

    const normalizedAlias = normalizeAlias(alias);

    validateAlias(normalizedAlias);

    const supabase = await createClient();

    const { data: currentAlias, error: fetchError } = await supabase
        .from("aliases")
        .select("id, value, url_object_id")
        .eq("id", parseInt(aliasId as string))
        .single();

    if (fetchError || !currentAlias) {
        console.error(fetchError?.message);
        throw new Error("Alias not found");
    }

    if (currentAlias.value === normalizedAlias) {
        redirect("/dashboard/urls", RedirectType.push);
    }

    const { data: existingAlias, error: aliasCheckError } = await supabase
        .from("aliases")
        .select("id, value")
        .eq("value", normalizedAlias)
        .neq("id", parseInt(aliasId as string))
        .maybeSingle();

    if (aliasCheckError) {
        console.error(aliasCheckError.message);
        throw new Error("Failed to check alias availability");
    }

    if (existingAlias) {
        throw new Error("Alias already exists");
    }

    const { error } = await supabase
        .from("aliases")
        .update({ value: normalizedAlias })
        .eq("id", parseInt(aliasId as string));

    if (error) {
        console.error(error.message);
        throw error;
    }

    redirect("/dashboard/urls", RedirectType.push);
}
