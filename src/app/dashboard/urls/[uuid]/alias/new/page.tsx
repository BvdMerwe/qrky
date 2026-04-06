import React from "react";
import {createClient} from "@/lib/supabase/server";
import {AliasForm} from "./components/form/alias-form";

export default async function NewAliasPage({
  params
}:{
    params: Promise<{ uuid: string}>
}): Promise<React.ReactNode> {
    const { uuid } = await params;
    const supabase = await createClient();
    const { data: url, error } = await supabase.from("url_objects")
        .select("uuid, url")
        .eq("uuid", uuid)
        .maybeSingle();

    if (error || !url) {
        throw new Error("URL not found");
    }

    return <AliasForm uuid={uuid} url={url.url} />;
}
