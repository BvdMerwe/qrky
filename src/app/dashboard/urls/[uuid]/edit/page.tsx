import React from "react";
import {createClient} from "@/lib/supabase/server";
import UrlEditForm from "@/app/dashboard/urls/[uuid]/edit/components/form/url-edit-form";

export default async function UrlEditPage({
  params
}:{
    params: Promise<{ uuid: string}>
}): Promise<React.ReactNode> {
    const { uuid } = await params;
    const supabase = await createClient();
    const { data: url, error } = await supabase.from("url_objects")
        .select("*")
        .eq("uuid", uuid)
        .maybeSingle();

    if (error) throw error;

    return (
        <UrlEditForm urlObject={url} />
    );
}