"use client"

import {useCallback, useRef, useState} from "react";
import {createClient} from "@/lib/supabase/browser";
import {AuthError, User} from "@supabase/auth-js";
import FormChangePassword from "@/components/auth/form-change-password";

export default function LayoutChangePassword() {
    const supabase = createClient();
    const passwordModalRef = useRef<HTMLDialogElement>(null);
    const [, setFormState] = useState({message: "", success: false});

    const initiatePasswordChange = useCallback(() => {
        setFormState({message: "", success: false});

        supabase.auth.reauthenticate()
            .then(({ error, data }: { data: { user: User | null }; error: AuthError | null }) => {
                if (error) {
                    console.error(error);
                    return;
                }
                if (data)
                    passwordModalRef.current?.showModal();
            })
            .catch(console.error);
    }, [passwordModalRef, supabase]);

    return (
        <>
            <button className="btn btn-ghost w-full mt-4" onClick={() => initiatePasswordChange()}>
                Change Password
            </button>

            <dialog id="password-modal" className="modal" ref={passwordModalRef}>
                <div className="modal-box prose">
                    <h2 className="text-center">Update your password</h2>

                    <FormChangePassword />

                    <form method="dialog">
                        <button className="btn btn-ghost w-full mt-4">Close</button>
                    </form>

                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    )
}