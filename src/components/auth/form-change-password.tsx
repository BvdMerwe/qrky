"use client"

import {changePassword} from "@/app/dashboard/user/actions";
import {useActionState, useRef, useState} from "react";
import ErrorMessageComponent from "@/components/ui/error-message";
import {TbLockCheck} from "react-icons/tb";
import InputPassword from "@/components/ui/form/input-password";

const initialState = {message: ""};

export default function FormChangePassword() {
    const [changePasswordState, changePasswordFormAction, changePasswordPending] = useActionState(changePassword, initialState);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const passwordModalRef = useRef<HTMLDialogElement>(null);

    return (
        <>
            {changePasswordPending
                ? null
                : <button className="btn btn-ghost w-full mt-4" onClick={() => passwordModalRef.current?.showModal()}>Change Password</button>
            }

            <dialog id="password-modal" className="modal" ref={passwordModalRef}>
                <div className="modal-box prose">
                    <h2 className="text-center">Update your password</h2>
                    <form className="flex flex-col gap-4">
                        <InputPassword value={currentPassword} onChange={setCurrentPassword} name="currentPassword" placeholder="Current password" />
                        <InputPassword value={newPassword} onChange={setNewPassword} name="newPassword" placeholder="New password" />
                        <InputPassword value={passwordConfirm} onChange={setPasswordConfirm} name="confirmNewPassword" placeholder="Confirm new password" icon={<TbLockCheck />} />

                        {changePasswordState?.message
                            ? <div className="col-span-2"><ErrorMessageComponent message={changePasswordState.message} /></div>
                            : null
                        }

                        <button className="btn btn-primary" formAction={changePasswordFormAction}>Update password</button>
                    </form>

                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    )
}