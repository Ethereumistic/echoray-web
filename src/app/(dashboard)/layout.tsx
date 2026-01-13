import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { AuthProvider } from '@/components/providers/auth-provider'

/**
 * Dashboard layout for authenticated pages.
 * Includes sidebar navigation and content area.
 * The middleware handles auth protection, but we also use AuthProvider
 * to sync auth state with Zustand for client-side features.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-background">
                <DashboardSidebar />
                <div className="lg:pl-64">
                    {children}
                </div>
            </div>
        </AuthProvider>
    )
}
