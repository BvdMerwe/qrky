"use client";

import React from "react";
import Input from "@/components/ui/form/input";
import { TbLink } from "react-icons/tb";
import { createAlias } from "../../actions";

interface AliasFormProps {
    uuid: string;
    url: string;
}

export function AliasForm({ uuid, url }: AliasFormProps): React.ReactNode {
    return (
        <div className="prose mx-auto text-center mt-20">
            <h1>Add alias to URL</h1>
            <p className="text-sm opacity-70">{url}</p>
            <form className="flex flex-col gap-4 max-w-md mx-auto" action={createAlias}>
                <input type="hidden" name="uuid" value={uuid} />
                <Input name="alias" icon={<TbLink />} defaultValue="" placeholder="my-custom-alias" />
                <button className="btn btn-primary">Add Alias</button>
            </form>
        </div>
    );
}
