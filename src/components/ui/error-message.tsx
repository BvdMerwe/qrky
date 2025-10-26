"use client"

import React from "react";
import {stringIsValid} from "@/lib/strings";

interface Props {
    message: string;
}

export default function ErrorMessageComponent({message}: Props): React.ReactNode {
    if (stringIsValid(message)) {
        return <div role="alert" className="alert alert-error alert-soft">
            <span>{message}</span>
        </div>
    } else {
        return null;
    }
}