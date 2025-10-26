"use client"

import React from "react";
import AlertMessageComponent, {AlertMessageProps} from "@/components/ui/alert/alert-message";
import cc from "classcat";

export default function ErrorMessageComponent({className, message}: AlertMessageProps): React.ReactNode {
    return <AlertMessageComponent message={message} className={cc((["alert-error", className]))} />;
}