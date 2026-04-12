import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import FormRegisterComponent from '@/components/auth/form-register';
import OAuthButtons from '@/components/auth/oauth-buttons';

export default async function RegisterPage() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (data?.user) {
        redirect('/dashboard/user');
    }

    return (
        <div className="flex flex-col gap-4 rounded-box bg-base-200 p-6 max-w-md mx-auto my-20">
            <h1 className="text-3xl font-bold self-center">Register to get QRky</h1>

            <span className="self-center">
                Already have an account?{' '}
                <Link href="/login" className="link link-secondary">Log in</Link>
            </span>

            <OAuthButtons />

            <div className="divider">OR</div>

            <FormRegisterComponent />

        </div>
    );
}