import React, {useState} from "react";
import {TbEye, TbLockPassword,} from "react-icons/tb";
import Input, {InputProps} from "@/components/ui/form/input";

export default function InputPassword({value, onChange, name, placeholder, icon}: InputProps): React.ReactNode {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Input
            value={value}
            onChange={onChange}
            name={name}
            placeholder={placeholder}
            icon={icon ?? <TbLockPassword />}
            type={showPassword ? "text" : "password"}
            renderAfterInput={
                <span
                    className="label cursor-pointer"
                    onMouseDown={() => setShowPassword(true)}
                    onTouchStart={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onTouchEnd={() => setShowPassword(false)}
                >
                    <TbEye/>
                </span>
            }
        />
    );
}