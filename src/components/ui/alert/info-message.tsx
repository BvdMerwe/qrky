"use client"

import React from "react";
import cc from "classcat";
import AlertMessageComponent, {AlertMessageProps} from "@/components/ui/alert/alert-message";

export default function InfoMessageComponent({className, message}: AlertMessageProps): React.ReactNode {
    return <AlertMessageComponent message={message} className={cc((["alert-info", className]))} />;
}