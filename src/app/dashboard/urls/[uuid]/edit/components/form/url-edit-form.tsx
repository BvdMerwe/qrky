'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/form/input';
import { TbLink } from 'react-icons/tb';
import { updateUrl } from '@/app/dashboard/urls/[uuid]/edit/actions-browser';
import { UrlObject } from '@/types/db/url-object';

interface UrlEditFormProps {
    urlObject: UrlObject;
}

export default function UrlEditForm({ urlObject }: UrlEditFormProps): React.ReactNode {
    const [urlForm, setUrlForm] = useState(urlObject.url);

    return (
        <div className="text-center mx-auto mt-20">
            <h1>Update URL</h1>
            <form className="flex flex-col gap-4 max-w-md mx-auto" action={updateUrl}>
                <Input name="url" icon={<TbLink/>} value={urlForm} onChange={setUrlForm} />
                <input type="hidden" defaultValue={urlObject.uuid} name="uuid" />
                <button className="btn btn-primary">Update</button>
            </form>
        </div>
    );
}