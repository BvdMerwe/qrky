'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'

import {createClient} from '@/lib/supabase/server'
import {stringIsValid} from "@/lib/strings";
import {ActionResponseInterface} from "@/interfaces/action-response";
import {authIsPasswordValid} from "@/lib/auth";

const TEXT_SUCCESS_PASSWORD_RESET = "A password reset message has been sent to your email address.";
const TEXT_ERROR_PASSWORD_FORMAT = "Password should contain at least 8 characters, an uppercase letter, lowercase letter, a number and a symbol.";
const TEXT_ERROR_GENERIC = "Email or password is invalid. Please try again.";
const TEXT_ERROR_EMAIL_REQUIRED = "Email is required.";

export async function login(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    if (!stringIsValid(data.email) || !stringIsValid(data.password)) {
        return { message: TEXT_ERROR_GENERIC, success: false };
    } else if (!authIsPasswordValid(data.password)) {
        return { message: TEXT_ERROR_PASSWORD_FORMAT, success: false };
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        if (error.code === 'invalid_credentials') {
            return { message: error.message, success: false };
        } else {
            console.error(error);
            redirect('/500');
        }
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard/user');
}

export async function resetPassword(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const email = formData.get('email');

    if (!stringIsValid(email)) {
        return { message: TEXT_ERROR_EMAIL_REQUIRED, success: false };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: "/login/reset-password" }
    );

    if (error) {
        return { message: error.message, success: false };
    } else {
        return { message: TEXT_SUCCESS_PASSWORD_RESET, success: true };
    }
}
