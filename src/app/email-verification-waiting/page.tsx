'use client';

import { startTransition, use, useActionState, useEffect, useState } from 'react';
import { resendVerification } from '@/app/email-verification-waiting/actions';
import SuccessMessageComponent from '@/components/ui/alert/success-message';
import ErrorMessageComponent from '@/components/ui/alert/error-message';
import { notFound } from 'next/navigation';

const TIMEOUT_RESEND_VISIBLE_MILLISECONDS = 60_000;
const initialState = { message: '', success: false };

export default function EmailVerificationWaiting({
    searchParams,
}: {
    searchParams: Promise<{ user?: string }>
}) {
    const [state, resendAction, pending] = useActionState(resendVerification, initialState);
    const [countdown, setCountdown] = useState(TIMEOUT_RESEND_VISIBLE_MILLISECONDS);

    const params = use(searchParams);

    useEffect(() => {
        const interval = setInterval(() => {
            if (countdown <= 0) {
                clearInterval(interval);
            } else {
                setCountdown(countdown - 100);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [countdown]);

    const userId = params.user;

    if (!userId) {
        notFound();
    }

    const resend = () => {
        resendAction({ userId: userId });
        setCountdown(TIMEOUT_RESEND_VISIBLE_MILLISECONDS);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 shadow-xl max-w-md w-full">
                <div className="card-body items-center text-center">
                    <div className="avatar avatar-placeholder">
                        <div className="bg-info text-info-content rounded-full w-24">
                            <span className="text-4xl">✉️</span>
                        </div>
                    </div>
                    <h2 className="card-title text-2xl mt-4">Check your email</h2>
                    <p className="text-base-content/70 mt-2">
                        We&apos;ve sent you a verification link to your email address.
                        Please click the link to verify your account before logging in.
                    </p>
                    <div className="divider"></div>
                    <p className="text-sm text-base-content/60">
                        Didn&apos;t receive the email? Check your spam folder or
                    </p>
                    {
                        pending ?
                            <button className="btn" disabled>
                                Sending verification email
                            </button>
                            :
                            countdown <= 0 &&
                            <button onClick={() => startTransition(() => resend())} className="btn btn-link">
                                Request a new verification email
                            </button>
                            || <button className="btn" disabled>
                                Request a new verification email (in {countdown / 1000}s)
                            </button>
                    }

                    {state?.success && state?.message && <SuccessMessageComponent message={state.message}/>}

                    {!state?.success && state?.message && <ErrorMessageComponent message={state.message}/>}
                </div>
            </div>
        </div>
    );
}
