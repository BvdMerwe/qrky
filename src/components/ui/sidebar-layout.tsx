"use client"

import {TbHome, TbLayoutSidebar, TbSettings} from "react-icons/tb";
import Link from "next/link";
import {createClient} from "@/lib/supabase/browser";
import {useEffect, useState} from "react";
import {User} from "@supabase/auth-js";
import {SupabaseClient} from "@supabase/supabase-js";
import {redirect, RedirectType} from "next/navigation";

interface Props {
    children?: React.ReactNode;
}


export default function SidebarLayout({children}: Props) {
    const supabase = createClient();
    const [_user, setUser] = useState<User>();
    const [userName, setUserName] = useState<string>();

    useEffect(() => {
        supabase.auth.getUser()
            .then(({data, error}) => {
                if (error) throw error;
                setUser(data.user);
                setUserName(renderName(data.user ?? null));
            })
    }, [supabase]);

    return (
        <div className="drawer drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle"/>
            <div className="drawer-content">
                {children}
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 flex flex-col items-start min-h-full">
                    {/* Sidebar content here */}
                    <ul className="menu w-full grow">

                        {/* list item */}
                        <li>
                            <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
                                <TbHome/>
                                <span className="is-drawer-close:hidden">Homepage</span>
                            </button>
                        </li>

                        {/* list item */}
                        <li>
                            <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">
                                <TbSettings/>
                                <span className="is-drawer-close:hidden">Settings</span>
                            </button>
                        </li>
                    </ul>

                    <div className="m-2">
                        <div className="dropdown dropdown-right dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                <div className="avatar avatar-placeholder">
                                    <div className="bg-neutral text-neutral-content w-8 rounded-full">
                                        <span className="text-xs uppercase">{userName}</span>
                                    </div>
                                </div>
                            </div>
                            <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                <li><a onClick={() => logOut(supabase)}>Log out</a></li>
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

async function logOut(supabase: SupabaseClient): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error;
    redirect("/login", RedirectType.push);
}

function renderName(user: User | null): string {
    return `${user?.user_metadata?.first_name?.[0] ?? "Q"}${user?.user_metadata?.last_name?.[0] ?? "R"}`;
}