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

            <OAuthButtons />

            <FormRegisterComponent />

            <div className="divider m-0"></div>

            <span className="self-center">
                Already have an account?
            </span>

            <Link href="/login" className="btn btn-secondary">Log in</Link>
        </div>
    );
}