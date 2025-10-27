import type {Metadata} from "next";
import {DynaPuff, Funnel_Sans} from "next/font/google";
import "./globals.css";
import FooterComponent from "@/components/ui/footer";

const sans = DynaPuff({
    variable: "--font-sans",
    subsets: ["latin"],
});

const mono = Funnel_Sans({
    variable: "--font-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "QRky - Beautiful QR Codes & Smart URL Shortening",
    description: "Generate custom-styled QR codes with rounded corners and embedded logos. Shorten URLs and track every scan with powerful analytics. Built with Next.js and Supabase.",
    keywords: ["QR code generator", "URL shortener", "custom QR codes", "analytics", "link tracking"],
    authors: [{ name: "Bernardus van der Merwe", url: "https://github.com/BvdMerwe" }],
    openGraph: {
        title: "QRky - Beautiful QR Codes & Smart URL Shortening",
        description: "Generate custom-styled QR codes with rounded corners and embedded logos. Track every scan with powerful analytics.",
        type: "website",
    },
};

export default function RootLayout({
   children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${sans.variable} ${mono.variable} antialiased min-h-screen`}
            >
                <div className="flex flex-col justify-start min-h-screen">
                    <div>{children}</div>
                    <div className="flex flex-col justify-end flex-1">
                        <FooterComponent />
                    </div>
                </div>
            </body>
        </html>
    );
}
