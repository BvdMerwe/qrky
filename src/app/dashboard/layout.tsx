import TopNavbar from "@/components/ui/top-navbar";
import React from "react";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TopNavbar>
            {children}
        </TopNavbar>
    )
}