import React, {useEffect, useState} from "react";
import {copyToClipboard} from "@/lib/clipboard";
import cc from "classcat";
import {TbCopy} from "react-icons/tb";

interface Props {
    value: string;
    children: React.ReactElement;
    className?: string;
}

export default function CopyToClipboardComponent({
    value = "",
    children,
    className,
}: Props) : React.ReactNode {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsCopied(() => false);
        }, 3000)
    }, [isCopied]);

    return (
        <span
            className={cc(["tooltip tooltip-top text-accent font-bold underline cursor-pointer", className])}
            onClick={async (e) => {
                e.preventDefault();
                await copyToClipboard(value);
                setIsCopied(true);
            }}
            data-tip={isCopied ? "Copied to clipboard!" : "Copy to clipboard"}
        >
            {children} <TbCopy className="inline"/>
        </span>
    );
}