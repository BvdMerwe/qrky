import React from "react";
import {TbLockPassword} from "react-icons/tb";

export interface InputProps {
    name: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    renderAfterInput?: React.ReactNode;
    type?: "password" | "email" | "text" | "hidden";
}

export default function Input({
    value,
    onChange,
    name,
    placeholder,
    icon,
    type,
    renderAfterInput,
    defaultValue
}: InputProps): React.ReactNode {
    return (
        <label className="input w-full">
            <span className="label">{icon ?? <TbLockPassword/>}</span>
            <input
                type={type ?? "text"}
                className=""
                name={name}
                placeholder={placeholder}
                value={value}
                defaultValue={defaultValue}
                onChange={(event) => onChange?.(event.target.value)}
            />
            {renderAfterInput}
        </label>
    );
}