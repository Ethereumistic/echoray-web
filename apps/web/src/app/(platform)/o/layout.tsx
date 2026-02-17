/**
 * Layout for /o routes (organization-level actions like create).
 * No longer duplicates Sidebar components as they are provided by the parent PlatformLayout.
 */
export default function OrgActionsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
