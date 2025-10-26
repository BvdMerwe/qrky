"use server"

import {createClient} from "@/lib/supabase/server";
import {redirect, RedirectType} from "next/navigation";
import {stringIsValid} from "@/lib/strings";
import {ErrorInterface} from "@/interfaces/error";
import {authGeneratePasswordFormula, authIsPasswordValid} from "@/lib/auth";

export async function changePassword(_state: ErrorInterface | void, formData: FormData): Promise<ErrorInterface | void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user === null) {
        redirect("/login");
    }

    const data = {
        email: user.email as string,
        password: formData.get('currentPassword') as string,
        newPassword: formData.get('newPassword') as string,
        confirmNewPassword: formData.get('confirmNewPassword') as string,
    }

    if (!stringIsValid(data.newPassword) || !stringIsValid(data.password) || !stringIsValid(data.confirmNewPassword)) {
        return { message: `None of the passwords can be empty.`};
    } else if (data.newPassword !== data.confirmNewPassword) {
        return { message: `New passwords do not match.` };
    } else if (!authIsPasswordValid(data.newPassword)) {
        return { message: authGeneratePasswordFormula() };
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { message: error.message };
    }

    await supabase.auth.updateUser({
        password: data.newPassword,
    });

    redirect("/dashboard/user");
}

export async function resetPassword(): Promise<ErrorInterface | void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user === null) {
        redirect("/login");
    } else if (typeof user.email === "undefined") {
        return { message: "Email is required" };
    } else {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: "/dashboard/user/update-password",
        })

        if (error) {
            return { message: error.message };
        } else {

        }
    }
}

export async function saveUser(_state: ErrorInterface | void, formData: FormData): Promise<ErrorInterface | void> {
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');

    if (!stringIsValid(firstName) || !stringIsValid(lastName)) {
        return { message: `First name or last name is invalid: "${firstName}" "${lastName}"` }
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user !== null) {
         await supabase.auth.updateUser({
            data: {
                ...user.user_metadata,
                first_name: firstName,
                last_name: lastName,
            }
        });
    } else {
        redirect("/login", RedirectType.push);
    }

}