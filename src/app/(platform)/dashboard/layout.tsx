/**
 * Layout for /dashboard routes (legacy redirect support).
 * No longer duplicates Sidebar components as they are provided by the parent PlatformLayout.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
