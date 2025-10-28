"use client"

import React from "react";
import Input from "@/components/ui/form/input";
import {TbLink} from "react-icons/tb";
import {createUrl} from "@/app/dashboard/urls/new/browser-actions";

export default function NewUrl(): React.ReactNode {
    return (
        <div className="prose text-center mx-auto mt-20">
            <h1>Create a new shortened URL</h1>
            <form className="flex flex-col gap-4 max-w-md mx-auto" action={createUrl}>
                <Input name="url" icon={<TbLink/>} defaultValue="" placeholder="https://luke.space/skywalker" />
                <button className="btn btn-primary">Create</button>
            </form>
        </div>
    );
}