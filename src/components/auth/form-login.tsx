"use client"

import {login} from "@/app/login/actions";
import {useActionState, useState} from "react";
import ErrorMessageComponent from "@/components/ui/alert/error-message";
import InputPassword from "@/components/ui/form/input-password";
import Input from "@/components/ui/form/input";

const initialState = {
    message: "",
    success: false,
}

export default function FormLoginComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [state, loginAction, pending] = useActionState(login, initialState)

    return (
        <form className="flex flex-col gap-4">
            <Input
                type="email"
                name="email"
                placeholder="luke@rebels.space"
                value={email}
                onChange={setEmail}
            />

            <InputPassword value={password} onChange={setPassword} name="password" placeholder="Password" />

            {state?.message && !state.success &&  <ErrorMessageComponent message={state.message}/>}

            {pending
                ? <button className="btn btn-primary" disabled>Logging in...</button>
                : <button className="btn btn-primary" formAction={loginAction}>Log in</button>
            }
        </form>
    );
}