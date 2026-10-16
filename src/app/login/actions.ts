'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { stringIsValid } from '@/lib/strings';
import { ActionResponseInterface } from '@/interfaces/action-response';

const TEXT_SUCCESS_PASSWORD_RESET = 'A password reset message has been sent to your email address.';
const TEXT_ERROR_GENERIC = 'Email or password is invalid. Please try again.';
const TEXT_ERROR_EMAIL_REQUIRED = 'Email is required.';

export async function login(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const supabase = await createClient();

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    if (!stringIsValid(data.email) || !stringIsValid(data.password)) {
        return { message: TEXT_ERROR_GENERIC, success: false };
    }

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        if (error.code === 'invalid_credentials') {
            return { message: error.message, success: false };
        }

        if (error.code === 'email_not_confirmed') {
            // signInWithPassword does not return the user object on this error,
            // so generate a signup confirmation link via the admin API to obtain
            // the user id. The link is generated (not emailed) purely to resolve
            // the user; we never send it — the waiting page has its own resend.
            const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                type: 'signup',
                email: data.email,
                password: data.password,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
                },
            });

            if (linkError || !linkData.user) {
                console.error(linkError ?? error);
                return { message: TEXT_ERROR_GENERIC, success: false };
            }

            redirect(`/email-verification-waiting?user=${linkData.user.id}`);
        }

        console.error(error);
        redirect('/500');
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard/urls');
}

export async function resetPassword(_state: ActionResponseInterface, formData: FormData): Promise<ActionResponseInterface> {
    const email = formData.get('email');

    if (!stringIsValid(email)) {
        return { message: TEXT_ERROR_EMAIL_REQUIRED, success: false };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login/reset-password`
    });

    if (error) {
        return { message: error.message, success: false };
    } else {
        return { message: TEXT_SUCCESS_PASSWORD_RESET, success: true };
    }
}
