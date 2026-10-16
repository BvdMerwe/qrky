'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';
import React, { useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/auth-js';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/actions/auth';
import cc from 'classcat';
import Image from 'next/image';

interface Props {
    children?: React.ReactNode;
}

export default function TopNavbar({ children }: Props) {
    const supabase = createClient();
    const [user, setUser] = useState<User>();
    const [userName, setUserName] = useState<string>();
    const pathname = usePathname();

    useEffect(() => {
        supabase.auth.getUser()
            .then(({ data, error }: { data: { user: User | null }; error: AuthError | null }) => {
                if (error) throw error;
                setUser(data.user ?? undefined);
                setUserName(renderName(data.user ?? null));
            });
    }, [supabase]);

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-base-300 shadow-sm border-b border-base-300 px-6">
                <div className="navbar-start gap-6">
                    <Link href="/" className="hover:aura hover:aura-rainbow font-sans text-xl font-bold text-primary tracking-tight rounded-lg p-0.5">
                        <Image src="/qrky-logotype.svg"
                            width={70}
                            height={40}
                            alt="logo" className="h-10 " />
                    </Link>
                    <div className="flex gap-2">
                        <Link
                            href="/dashboard/urls"
                            className={cc(['btn', isActive('/dashboard/urls')
                                ? 'btn-accent'
                                : 'btn-soft btn-neutral'])}
                        >
                            URLs
                        </Link>
                    </div>
                </div>

                <div className="navbar-end">

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar avatar-placeholder ring ring-primary ring-offset-base-100">
                            <div className="bg-neutral text-neutral-content w-12 rounded-full">
                                <span>{userName ?? '??'}</span>
                            </div>
                        </div>
                        <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow-lg border border-base-300">
                            <li className="menu-title px-3 py-2 border-b border-base-200">
                                <span className="font-medium text-base-content">{user?.user_metadata?.first_name ?? 'User'} {user?.user_metadata?.last_name ?? ''}</span>
                                <span className="text-xs text-base-content/60 block">{user?.email}</span>
                            </li>
                            <li><Link href="/dashboard/user">User Preferences</Link></li>
                            <li><button onClick={() => signOut()}>Log out</button></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <main className="p-4 lg:p-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}

function renderName(user: User | null): string {
    return `${user?.user_metadata?.first_name?.[0] ?? 'Q'}${user?.user_metadata?.last_name?.[0] ?? 'R'}`;
}
