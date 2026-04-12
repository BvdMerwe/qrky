'use client';

import React, { useActionState } from 'react';
import Input from '@/components/ui/form/input';
import { TbLink } from 'react-icons/tb';
import { createAlias } from '../../actions';
import ErrorMessageComponent from '@/components/ui/alert/error-message';

const initialState = { message: '', success: false };

interface AliasFormProps {
    uuid: string;
    url: string;
}

export function AliasForm({ uuid, url }: AliasFormProps): React.ReactNode {
    const [state, formAction, pending] = useActionState(createAlias, initialState);

    return (
        <div className="prose mx-auto text-center mt-20">
            <h1>Add alias to URL</h1>
            <p className="text-sm opacity-70">{url}</p>
            <form className="flex flex-col gap-4 max-w-md mx-auto">
                <input type="hidden" name="uuid" value={uuid} />
                <Input name="alias" icon={<TbLink />} defaultValue="" placeholder="my-custom-alias" />
                {state?.message && !state.success && <ErrorMessageComponent message={state.message} />}
                {pending
                    ? <button className="btn btn-primary" disabled>Adding...</button>
                    : <button className="btn btn-primary" formAction={formAction}>Add Alias</button>
                }
            </form>
        </div>
    );
}
