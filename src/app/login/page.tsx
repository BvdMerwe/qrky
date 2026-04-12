import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import FormLoginComponent from '@/components/auth/form-login';
import OAuthButtons from '@/components/auth/oauth-buttons';

export default async function LoginPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (data?.user) {
        redirect('/dashboard/user');
    }

    return (
        <div className="flex flex-col gap-4 rounded-box bg-base-200 p-6 max-w-md mx-auto my-20">
            <h1 className="text-3xl font-bold self-center">Log in and get QRky</h1>

            <span className="self-center">
                Don&#39;t have an account?{' '}
                <Link href="/register" className="link link-secondary">Register</Link>
            </span>

            <OAuthButtons />

            <div className="divider">OR</div>

            <FormLoginComponent />

            <Link className="link link-accent" href="/login/forgot-password">Forgot password?</Link>
        </div>
    );
}