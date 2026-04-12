'use client';

import React from 'react';
import Input from '@/components/ui/form/input';
import { TbLink } from 'react-icons/tb';
import { createUrl } from '@/app/dashboard/urls/new/actions-browser';

export default function NewUrl(): React.ReactNode {
    return (
        <div className="prose mx-auto text-center mt-20">
            <h1>Create a new shortened URL</h1>
            <form className="flex flex-col gap-4 max-w-md mx-auto" action={createUrl}>
                <Input name="url" icon={<TbLink/>} defaultValue="" placeholder="https://luke.space/skywalker" />
                <Input name="alias" icon={<TbLink/>} defaultValue="" placeholder="my-custom-alias (optional)" />
                <button className="btn btn-primary">Create</button>
            </form>
        </div>
    );
}