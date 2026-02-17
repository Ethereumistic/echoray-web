/**
 * Layout for /p routes (personal-level actions like settings).
 * No longer duplicates Sidebar components as they are provided by the parent PlatformLayout.
 */
export default function PersonalActionsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
