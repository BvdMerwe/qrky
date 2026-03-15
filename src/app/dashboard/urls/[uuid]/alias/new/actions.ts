import { createClient } from "@/lib/supabase/browser";
import { stringIsValid } from "@/lib/strings";
import { redirect, RedirectType } from "next/navigation";

const RESERVED_NAMES = [
    'dashboard', 'api', 'login', 'logout', 'admin', 'qr', 'q', 'u',
    'auth', 'callback', 'new', 'edit', 'analytics', 'settings'
];

const ALIAS_REGEX = /^[a-z0-9-]+$/;

function validateAlias(alias: string): void {
    const normalizedAlias = alias.toLowerCase().trim();

    // Check length (3-50 characters)
    if (normalizedAlias.length < 3 || normalizedAlias.length > 50) {
        throw new Error("Alias must be between 3 and 50 characters");
    }

    // Check valid characters
    if (!ALIAS_REGEX.test(normalizedAlias)) {
        throw new Error("Alias can only contain letters, numbers, and hyphens");
    }

    // Check reserved names
    if (RESERVED_NAMES.includes(normalizedAlias)) {
        throw new Error(`"${normalizedAlias}" is a reserved name and cannot be used as an alias`);
    }
}

export async function createAlias(formData: FormData): Promise<void> {
    const uuid = formData.get("uuid");
    const alias = formData.get("alias");

    if (!stringIsValid(uuid) || !stringIsValid(alias)) {
        throw new Error("Invalid input");
    }

    const normalizedAlias = alias.toLowerCase().trim();

    // Validate alias format
    validateAlias(normalizedAlias);

    const supabase = createClient();

    // Check if URL exists
    const { data: urlObject, error: urlError } = await supabase
        .from("url_objects")
        .select("id")
        .eq("uuid", uuid)
        .single();

    if (urlError || !urlObject) {
        console.error(urlError?.message);
        throw new Error("URL not found");
    }

    // BUG FIX: Check if alias already exists globally (case insensitive)
    // This prevents routing conflicts where multiple URLs could have the same alias
    const { data: existingAlias, error: aliasCheckError } = await supabase
        .from("aliases")
        .select("id, value")
        .eq("value", normalizedAlias)
        .maybeSingle();

    if (aliasCheckError) {
        console.error(aliasCheckError.message);
        throw new Error("Failed to check alias availability");
    }

    if (existingAlias) {
        throw new Error("Alias already exists");
    }

    // Insert the alias with normalized (lowercase) value
    const { error } = await supabase
        .from("aliases")
        .insert({
            value: normalizedAlias,
            url_object_id: urlObject.id,
        });

    if (error) {
        console.error(error.message);
        throw error;
    }

    redirect("/dashboard/urls", RedirectType.push);
}
