import React from "react";
import {createClient} from "@/lib/supabase/server";
import Input from "@/components/ui/form/input";
import {TbLink} from "react-icons/tb";
import {createAlias} from "./actions";

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

    return (
        <div className="prose mx-auto text-center mt-20">
            <h1>Add alias to URL</h1>
            <p className="text-sm opacity-70">{url.url}</p>
            <form className="flex flex-col gap-4 max-w-md mx-auto" action={createAlias}>
                <input type="hidden" name="uuid" value={uuid} />
                <Input name="alias" icon={<TbLink/>} defaultValue="" placeholder="my-custom-alias" />
                <button className="btn btn-primary">Add Alias</button>
            </form>
        </div>
    );
}
