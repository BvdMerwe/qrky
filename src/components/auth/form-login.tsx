"use client"

import {TbMail} from "react-icons/tb";
import {login} from "@/app/login/actions";
import {useActionState, useState} from "react";
import ErrorMessageComponent from "@/components/ui/error-message";
import InputPassword from "@/components/ui/form/input-password";

const intialState = {
    message: "",
}

export default function FormLoginComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [state, loginAction, pending] = useActionState(login, intialState)

    return (
        <form className="flex flex-col gap-4">
            <label className="input w-full">
                <span className="label"><TbMail/></span>
                <input
                    type="text"
                    className=""
                    name="email"
                    placeholder="luke@rebels.space"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </label>

            <InputPassword value={password} onChange={setPassword} name="password" placeholder="Password" />

            {state?.message && <div><ErrorMessageComponent message={state.message}/></div>}

            {pending
                ? <button className="btn btn-primary" disabled>Logging in...</button>
                : <button className="btn btn-primary" formAction={loginAction}>Log in</button>
            }
        </form>
    );
}