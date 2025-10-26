import SidebarLayout from "@/components/ui/sidebar-layout";
import React from "react";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarLayout>
            {children}
        </SidebarLayout>
    )
}