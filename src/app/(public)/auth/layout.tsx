/**
 * Auth layout for login, signup, and other auth-related pages.
 * This is a nested layout within (public), so it inherits the navbar/footer.
 * Just centers the auth forms.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 py-12">
            {children}
        </div>
    )
}
