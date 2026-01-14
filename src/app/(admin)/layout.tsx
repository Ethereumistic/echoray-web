"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/use-permissions"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { OrgInitializer } from "@/components/dashboard/org-initializer"
import { motion } from "framer-motion"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { can, isLoading, isAuthenticated } = usePermissions()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !can("system.admin"))) {
            router.push("/dashboard")
        }
    }, [isLoading, isAuthenticated, can, router])

    // OrgInitializer must render unconditionally to populate the auth store
    // This allows isLoading to be set to false once organizations are fetched
    if (isLoading) {
        return (
            <>
                <OrgInitializer />
                <div className="flex h-screen w-screen items-center justify-center bg-black">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="size-8 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                </div>
            </>
        )
    }

    if (!can("system.admin")) {
        return null // Will redirect in useEffect
    }

    return (
        <SidebarProvider>
            <OrgInitializer />
            <AdminSidebar />
            <SidebarInset className="bg-zinc-950 text-white min-h-screen">
                <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
