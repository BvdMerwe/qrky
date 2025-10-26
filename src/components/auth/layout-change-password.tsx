"use client"

import {useCallback, useRef} from "react";
import {createClient} from "@/lib/supabase/browser";
import FormChangePassword from "@/components/auth/form-change-password";

const initialState = {message: "", success: false};

export default function LayoutChangePassword() {
    const supabase = createClient();
    const passwordModalRef = useRef<HTMLDialogElement>(null);

    const initiatePasswordChange = useCallback(() => {
        // Reset form state when opening modal
        initialState.success = false;

        supabase.auth.reauthenticate().then(({error, data}) => {
            if (error) return console.error(error);
            if (data)
                passwordModalRef.current?.showModal();
        });
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