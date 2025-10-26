"use client"

import React, {useActionState} from "react";
import Input from "@/components/ui/form/input";
import {resetPassword} from "@/app/login/actions";
import ErrorMessageComponent from "@/components/ui/alert/error-message";
import {TbMail} from "react-icons/tb";
import SuccessMessageComponent from "@/components/ui/alert/success-message";

export default function FormForgotPassword(): React.ReactNode {
    const [state, resetPasswordAction, pending] = useActionState(resetPassword, {message: "", success: false});

    return (
        <form className="flex flex-col gap-4">
            <Input name="email" placeholder="Email" icon={<TbMail/>}/>

            {!state?.success && state.message &&
                <ErrorMessageComponent message={state.message} />
            }
            {state?.success && state.message &&
                <SuccessMessageComponent message={state.message} />
            }

            {pending
                ? <button className="btn btn-primary w-full" disabled>Submitted...</button>
                : <button className="btn btn-primary w-full" formAction={resetPasswordAction}>Submit</button>
            }
        </form>
    );
}