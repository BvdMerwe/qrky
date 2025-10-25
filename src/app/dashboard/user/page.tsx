import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardUserPage() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        redirect('/login')
    }

    const {user} = data;

    return (
        <div className="prose mx-auto pt-">
            <h1 className="text-center">Hello {user.email}</h1>
        </div>
    );
}