import { HeroBackground } from "@/components/sections/hero-background"

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
        <div className="min-h-[calc(100vh-4.9rem)] flex items-center justify-center">
            <div className="w-full max-w-md p-6 md:p-10">
                {children}
            </div>
            <div className="hidden xl:flex">
                <HeroBackground />
            </div>
        </div>
    )
}
