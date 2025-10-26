"use client"

import {changePassword} from "@/app/dashboard/user/actions";
import {useActionState, useState} from "react";
import ErrorMessageComponent from "@/components/ui/alert/error-message";
import {TbLockCheck, TbMailCheck} from "react-icons/tb";
import InputPassword from "@/components/ui/form/input-password";
import Input from "@/components/ui/form/input";
import SuccessMessageComponent from "@/components/ui/alert/success-message";
import InfoMessageComponent from "@/components/ui/alert/info-message";
import {stringIsValid} from "@/lib/strings";

const initialState = {message: "", success: false};

export default function FormChangePassword() {
    const [changePasswordState, changePasswordFormAction, changePasswordPending] = useActionState(changePassword, initialState);
    const [securityCode, setSecurityCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    let authCode = null;

    if (window) {
        authCode = (new URLSearchParams(window.location.search)).get("code");
    }

    return (
        <>
            <form className="flex flex-col gap-4">
                {changePasswordState?.success === false && <>
                    <InfoMessageComponent message="We&#39;ve sent you an email with a One Time Pin (OTP), please fill it below with your new password."/>
                    <Input
                        value={securityCode}
                        onChange={setSecurityCode}
                        name="securityCode"
                        placeholder="One Time Pin (OTP)"
                        icon={<TbMailCheck/>}
                    />
                    <InputPassword
                        value={newPassword}
                        onChange={setNewPassword}
                        name="newPassword"
                        placeholder="New password"
                    />
                    <InputPassword
                        value={passwordConfirm}
                        onChange={setPasswordConfirm}
                        name="confirmNewPassword"
                        placeholder="Confirm new password"
                        icon={<TbLockCheck/>}
                    />

                    {stringIsValid(authCode) &&
                        <input type="hidden" defaultValue={authCode} name="code" />
                    }

                    {changePasswordPending
                        ? <button className="btn btn-primary" disabled>Update password</button>
                        : <button className="btn btn-primary" formAction={changePasswordFormAction}>Update password</button>
                    }
                </>}

                {changePasswordState?.message && changePasswordState?.success === false
                    ? <ErrorMessageComponent message={changePasswordState.message} className="col-span-2"/>
                    : null
                }

                {changePasswordState?.message && changePasswordState?.success
                    ? <SuccessMessageComponent message={changePasswordState.message} className="col-span-2"/>
                    : null
                }
            </form>
        </>
    )
}