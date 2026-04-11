'use client';

import { createClient } from "@/lib/supabase/browser";
import { FaGithub, FaGoogle } from "react-icons/fa6";

export default function OAuthButtons() {
    const handleOAuthSignIn = async (provider: 'google' | 'github') => {
        const supabase = createClient();
        
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            },
        });

        if (error) {
            console.error('OAuth error:', error);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                className="btn btn-neutral"
                onClick={() => handleOAuthSignIn('google')}
            >
                <FaGoogle />
                Continue with Google
            </button>
            <button
                type="button"
                className="btn btn-neutral"
                onClick={() => handleOAuthSignIn('github')}
            >
                <FaGithub />
                Continue with Github
            </button>
        </div>
    );
}