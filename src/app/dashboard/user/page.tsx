"use client"

import {createClient} from '@/lib/supabase/browser'
import {TbMail, TbUser} from "react-icons/tb";
import {saveUser} from "@/app/dashboard/user/actions";
import {useActionState, useEffect, useState} from "react";
import {User} from "@supabase/auth-js";
import ErrorMessageComponent from "@/components/ui/error-message";
import FormChangePassword from "@/components/auth/form-change-password";
import {router} from "next/client";

const initialState = {
    message: '',
}

const supabase = createClient();

export default function DashboardUserPage() {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        supabase.auth.getUser()
            .then(({data, error}) => {
                if (error || !data?.user) {
                    router.push('/login')
                    return;
                }
                setUser(data.user);
            });
    }, []);

    const [saveUserState, userFormAction, userFormPending] = useActionState(saveUser, initialState);

    return (
        <div className="prose mx-auto pt-20">
            <h1 className="text-center">Hello {user?.user_metadata?.first_name ?? user?.email ?? "friend"}!</h1>
            <form className="grid gap-4 grid-cols-2">
                <label className="input input-info w-full col-span-2">
                    <span className="label"><TbMail/></span>
                    <input className="" type="email" placeholder="Email" disabled defaultValue={user?.email}/>
                </label>

                <label className="input input-info w-full">
                    <span className="label"><TbUser/></span>
                    <input className="" name="firstName" type="text" placeholder="Luke" defaultValue={user?.user_metadata?.first_name ?? ""}/>
                </label>

                <label className="input input-info w-full">
                    <span className="label"><TbUser/></span>
                    <input className="" name="lastName" type="text" placeholder="Skywalker" defaultValue={user?.user_metadata?.last_name ?? ""}/>
                </label>

                {saveUserState?.message
                    ? <div className="col-span-2"><ErrorMessageComponent message={saveUserState.message} /></div>
                    : null
                }

                {userFormPending
                    ? <button className="btn btn-primary col-span-2" disabled>Saving...</button>
                    : <button className="btn btn-primary col-span-2" formAction={userFormAction}>Save</button>
                }

            </form>

            <FormChangePassword />
        </div>
    );
}