"use client";

import React, { useActionState } from "react";
import Input from "@/components/ui/form/input";
import { TbLink } from "react-icons/tb";
import { updateAlias } from "../../actions";
import Link from "next/link";
import ErrorMessageComponent from "@/components/ui/alert/error-message";

const initialState = { message: "", success: false };

interface EditAliasFormProps {
    aliasId: string;
    currentAlias: string;
    url: string;
}

export function EditAliasForm({ aliasId, currentAlias, url }: EditAliasFormProps): React.ReactNode {
    const [state, formAction, pending] = useActionState(updateAlias, initialState);

    return (
        <div className="prose mx-auto text-center mt-20">
            <h1>Edit Alias</h1>
            <p className="text-sm opacity-70">{url}</p>
            <form className="flex flex-col gap-4 max-w-md mx-auto">
                <input type="hidden" name="aliasId" value={aliasId} />
                <Input name="alias" icon={<TbLink />} defaultValue={currentAlias} placeholder="my-custom-alias" />
                {state?.message && !state.success && <ErrorMessageComponent message={state.message} />}
                <div className="flex gap-2 justify-center">
                    <Link href="/dashboard/urls" className="btn btn-ghost">Cancel</Link>
                    {pending
                        ? <button className="btn btn-primary" disabled>Saving...</button>
                        : <button className="btn btn-primary" formAction={formAction}>Save Changes</button>
                    }
                </div>
            </form>
        </div>
    );
}
