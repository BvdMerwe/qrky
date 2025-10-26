"use client"

import React from "react";
import {stringIsValid} from "@/lib/strings";
import cc from "classcat";

export interface AlertMessageProps {
    message: string;
    className?: string;
}

export default function AlertMessageComponent({className, message}: AlertMessageProps): React.ReactNode {
    if (stringIsValid(message)) {
        return <p role="alert" className={cc(["alert alert-soft", className])}>
            <span>{message}</span>
        </p>
    } else {
        return null;
    }
}