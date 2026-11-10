import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { LuMenu, LuSparkles } from 'react-icons/lu';

export default function NavbarHome() {
    const links: { text: string, href: string }[] = [
        // { text: 'Features', href: '#features' },
        // { text: 'How it works', href: '#how-it-works' },
        // { text: 'Analytics', href: '#analytics' },
        // { text: 'Pricing', href: '#pricing' },
    ];

    return (
        <div className="navbar bg-base-300 shadow-sm border-b border-base-300 px-6 gap-2">
            <div className="navbar-start gap-6">
                <Link href="/" className="hover:aura hover:aura-rainbow font-sans text-xl font-bold text-primary tracking-tight rounded-lg p-0.5">
                    <Image src="/qrky-logotype.svg"
                        width={70}
                        height={40}
                        alt="logo" className="h-10 "/>
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex gap-6">
                {links.map(({ text, href }) => (
                    <a key={href} href={href}>{text}</a>
                ))}
            </div>

            <div className="navbar-end flex gap-3.5">
                <Link href="/login" className="hidden lg:flex btn btn-ghost font-bold">Login</Link>
                <Link className="btn btn-primary text-primary-content font-bold" href="/register"><LuSparkles/>Get started free</Link>
            </div>

            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                    <LuMenu />
                </div>
                <ul
                    tabIndex={-1}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-32 p-2 shadow">
                    <ul className="menu menu-vertical px-1 w-full">
                        {links.map(({ text, href }) => (
                            <li key={href}><a key={href} href={href}>{text}</a></li>
                        ))}
                    </ul>
                    <Link href="/login" className="btn btn-outline font-bold">Login</Link>
                </ul>
            </div>
        </div>
    );
}