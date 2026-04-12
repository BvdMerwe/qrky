'use client';

import { TbLayoutSidebar, TbLink } from 'react-icons/tb';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';
import React, { useEffect, useMemo, useState } from 'react';
import { User, AuthError } from '@supabase/auth-js';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/actions/auth';
import cc from 'classcat';

interface Props {
    children?: React.ReactNode;
}

interface Link {
    name: string;
    to: string;
    icon: React.ReactNode;
}

export default function SidebarLayout({ children }: Props) {
    const supabase = createClient();
    const [user, setUser] = useState<User>();
    const [userName, setUserName] = useState<string>();
    const [firstName, setFirstName] = useState<string>();
    const [lastName, setLastName] = useState<string>();
    const pathname = usePathname();

    useEffect(() => {
        supabase.auth.getUser()
            .then(({ data, error }: { data: { user: User | null }; error: AuthError | null }) => {
                if (error) throw error;
                setUser(data.user ?? undefined);
                setUserName(renderName(data.user ?? null));
                setFirstName(data.user?.user_metadata?.first_name);
                setLastName(data.user?.user_metadata?.last_name);
            });
    }, [supabase]);

    const links = useMemo<Link[]>(() => ([
        {
            name: 'URLs',
            icon: <TbLink className="min-h-6" />,
            to: '/dashboard/urls',
        },
    ]), [user]);

    return (
        <div className="drawer drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle"/>
            <div className="drawer-content px-4 m-0">
                {children}
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 flex flex-col items-start min-h-full">
                    {/* Sidebar content here */}
                    <ul className="menu w-full grow">

                        {links.map((link: Link) => (
                            <li key={link.name}>
                                <Link href={link.to} className={cc([
                                    'is-drawer-close:tooltip is-drawer-close:tooltip-right is-drawer-close:btn-ghost',
                                    {
                                        'menu-active': link.to == pathname
                                    }
                                ])} data-tip={link.name}>
                                    {link.icon}
                                    <span className="is-drawer-close:hidden">{link.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="m-2 is-drawer-open:min-w-[230px]">
                        <div className="dropdown dropdown-top dropdown-start w-full">
                            <button tabIndex={0} role="button" className="cursor pointer rounded is-drawer-open:hover:bg-base-100 is-drawer-open:p-1 is-drawer-close:w-full text-start is-drawer-open:w-full">
                                <div className="is-drawer-close:btn is-drawer-close:btn-circle is-drawer-close:btn-ghost avatar avatar-placeholder">
                                    <div className="bg-neutral text-neutral-content w-8 rounded-full">
                                        <span className="text-xs uppercase">{userName}</span>
                                    </div>
                                </div>{' '}
                                <span className="is-drawer-close:hidden">{firstName ?? 'QR'} {lastName ?? 'ky'}</span>
                            </button>
                            <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm mb-2">
                                <li><button onClick={() => signOut()}>Log out</button></li>
                                <li><Link href="/dashboard/user">User Preferences</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* button to open/close drawer */}
                    <div className="m-2 is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Open">
                        <label htmlFor="my-drawer-4" className="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180">
                            <TbLayoutSidebar/>
                        </label>
                    </div>

                </div>
            </div>
        </div>
    );
}

function renderName(user: User | null): string {
    return `${user?.user_metadata?.first_name?.[0] ?? 'Q'}${user?.user_metadata?.last_name?.[0] ?? 'R'}`;
}