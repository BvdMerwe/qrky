'use server'

import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {stringIsValid} from "@/lib/strings";
import {ActionResponseInterface} from "@/interfaces/action-response";
import {authGeneratePasswordFormula, authIsPasswordValid} from "@/lib/auth";

export async function register(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const supabase = await createClient()

    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!stringIsValid(email) || !stringIsValid(password) || !stringIsValid(confirmPassword)) {
        return { message: `Email or password is invalid: ${email} ${password}`, success: false };
    } else if (!authIsPasswordValid(password)) {
        return { message: authGeneratePasswordFormula(), success: false };
    } else if (password !== confirmPassword) {
        return { message: `New passwords do not match.`, success: false };
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
        return { message: error.message, success: false };
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard/user')
}