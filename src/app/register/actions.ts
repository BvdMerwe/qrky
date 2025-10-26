'use server'

import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {stringIsValid} from "@/lib/strings";
import {ErrorInterface} from "@/interfaces/error";
import {authGeneratePasswordFormula, authIsPasswordValid} from "@/lib/auth";

export async function register(_state: ErrorInterface|void, formData: FormData): Promise<ErrorInterface|void> {
    const supabase = await createClient()

    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!stringIsValid(email) || !stringIsValid(password) || !stringIsValid(confirmPassword)) {
        return { message: `Email or password is invalid: ${email} ${password}` };
    } else if (!authIsPasswordValid(password)) {
        return { message: authGeneratePasswordFormula() };
    } else if (password !== confirmPassword) {
        return { message: `New passwords do not match.` };
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            }
        }
    })

    if (error) {
        console.error(error)
        redirect('/500')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard/user')
}