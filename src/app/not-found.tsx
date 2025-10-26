"use client"

import Link from "next/link";
import {useEffect, useState} from "react";

export default function NotFound() {
    const facts = [
        "being scanned.",
        "redirecting URL traffic.",
        "shortening URLs.",
        "driving campaigns.",
        "creating custom QR codes.",
        "fitting business requirements.",
    ]
    const [currentFact, setCurrentFact] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentFact((previousValue) => previousValue + 1);
        }, 3000);

        return () => clearInterval(timer); // Cleanup
    }, []);

    return (
        <div className="prose w-full h-screen mt-20 container mx-auto">
            <h1>Page Not Found</h1>
            <p>It seems this page went out soul searching and could not be found :(</p>

            <p>Stick around and enjoy<sup>*</sup> this list of facts about your QRky:</p>
            <span className="text-2xl !font-sans">
                Your <span className="rainbow text-md">QRky</span> likes {facts[currentFact % facts.length]}
            </span>
            <div className="divider uppercase">or</div>
            <Link href="/public" className="btn btn-primary w-full">Return home</Link>
            <p className="text-sm text-center opacity-30"><sup>*</sup>Enjoy each fact equally.</p>
        </div>
    )
}