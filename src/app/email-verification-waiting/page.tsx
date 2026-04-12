'use client';

import Link from 'next/link';

export default function EmailVerificationWaiting() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 shadow-xl max-w-md w-full">
                <div className="card-body items-center text-center">
                    <div className="avatar placeholder">
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
                    <Link href="/resend-verification" className="btn btn-link">
                        Request a new verification email
                    </Link>
                </div>
            </div>
        </div>
    );
}
