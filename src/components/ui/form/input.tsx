import React from 'react';
import { TbPencil } from 'react-icons/tb';
import cc from 'classcat';

export interface InputProps {
    name: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    renderAfterInput?: React.ReactNode;
    type?: 'password' | 'email' | 'text' | 'hidden';
    disabled?: boolean;
    className?: string;
}

export default function Input({
    value,
    onChange,
    name,
    placeholder,
    icon,
    type,
    renderAfterInput,
    defaultValue,
    disabled = false,
    className
}: InputProps): React.ReactNode {
    return (
        <label className={cc(['input w-full', className])}>
            <span className="label">{icon ?? <TbPencil/>}</span>
            <input
                type={type ?? 'text'}
                name={name}
                placeholder={placeholder}
                value={value}
                defaultValue={defaultValue}
                onChange={(event) => onChange?.(event.target.value)}
                disabled={disabled}
            />
            {renderAfterInput}
        </label>
    );
}