import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

/**
 * Public layout for marketing pages.
 * Auth pages have their own nested layout that overrides this.
 * Includes the main navbar and footer for marketing pages.
 */
export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    )
}
