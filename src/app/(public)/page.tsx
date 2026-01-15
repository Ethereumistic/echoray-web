import { ClientPortal } from '@/components/sections/client-portal'
import { CTA } from '@/components/sections/cta'
import { FAQ } from '@/components/sections/faq'
import { Hero } from '@/components/sections/hero'
import { HowItWorks } from '@/components/sections/how-it-works'
import { Pricing } from '@/components/sections/pricing'
import { ServicesCarousel } from '@/components/sections/services-carousel'
import { ServicesGrid } from '@/components/sections/services-grid'
import { WhatsIncluded } from '@/components/sections/whats-included'

/**
 * Marketing home page.
 */
export default function HomePage() {
    return (
        <>
            <Hero />
            <ServicesGrid />
            <WhatsIncluded />
            <Pricing />
            <ServicesCarousel />
            <HowItWorks />
            <ClientPortal />
            <FAQ />
            <CTA />
        </>
    )
}
