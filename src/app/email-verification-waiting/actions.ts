'use server';

import { createClient } from '@/lib/supabase/server';
import { ActionResponseInterface } from '@/interfaces/action-response';

export async function resendVerification(
    _state: ActionResponseInterface,
    { userId }: { userId: string }
): Promise<ActionResponseInterface> {
    const supabase = await createClient();
    const { data, error: errorUser } = await supabase.auth.admin.getUserById(userId);

    if (errorUser || !data.user.email) {
        console.error(errorUser);
        return {
            message: 'Failed to get user to resend verification email.',
            success: false
        };
    }

    const { error: errorResend } = await supabase.auth.resend({
        type: 'signup',
        email: data.user.email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        }
    });

    if (errorResend) {
        if (errorResend.code === 'over_email_send_rate_limit') {
            return {
                message: 'A verification email was just sent. Please wait a minute before requesting another.',
                success: false,
            };
        }

        console.error(errorResend);

        return { message: 'Unable to resend verification email. Please try again later.', success: false };
    }

    return {
        message:
            'Email verification sent! Please check your email to verify your account before logging in.',
        success: true,
    };
}
