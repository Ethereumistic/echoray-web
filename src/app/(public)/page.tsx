import { Hero } from '@/components/sections/hero'
import { ServicesGrid } from '@/components/sections/services-grid'

/**
 * Marketing home page.
 */
export default function HomePage() {
    return (
        <>
            <Hero />
            <ServicesGrid />
            {/* Other marketing sections will go here */}
        </>
    )
}
