import React, {useState} from "react";
import {TbEye, TbLockPassword} from "react-icons/tb";

interface Props {
    value: string;
    onChange: (value: string) => void;
    name: string;
    placeholder?: string;
    icon?: React.ReactNode;
}

export default function InputPassword({value, onChange, name, placeholder, icon}: Props): React.ReactNode {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <label className="input w-full">
            <span className="label">{icon ?? <TbLockPassword/>}</span>
            <input
                type={showPassword ? "text" : "password"}
                className=""
                name={name} placeholder={placeholder ?? "Password"}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <span
                className="label cursor-pointer"
                onMouseDown={() => setShowPassword(true)}
                onTouchStart={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onTouchEnd={() => setShowPassword(false)}
            >
                <TbEye/>
            </span>
        </label>
    );
}