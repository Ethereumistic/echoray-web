import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { OrgInitializer } from '@/components/dashboard/org-initializer'

/**
 * Dashboard layout for authenticated pages.
 * Includes sidebar navigation and content area.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <OrgInitializer />
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
