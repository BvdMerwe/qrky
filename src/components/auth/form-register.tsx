"use client"

import {TbLockPassword, TbMail} from "react-icons/tb";
import {register} from "@/app/register/actions";
import {useState} from "react";
import cc from "classcat";

interface Props {
    registerAction: typeof register;
}

export default function FormRegisterComponent({registerAction}: Props) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");

    return (<form className="flex flex-col gap-4">
        <label className="input w-full">
            <span className="label"><TbMail/></span>
            <input
                className=""
                name="email"
                placeholder="luke@rebels.space"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
        </label>

        <label className="input w-full">
            <span className="label"><TbLockPassword/></span>
            <input
                type="password"
                className=""
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </label>

        <label className="input w-full">
            <span className="label"><TbLockPassword/></span>
            <input
                type="password"
                className=""
                name="password"
                placeholder="Confirm password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
            />
        </label>

        <button
            className={cc(["btn btn-primary", {
                "btn-disabled": !email || !password || !passwordConfirm,
            }])}
            formAction={registerAction}
        >
            Register
        </button>
    </form>);
}