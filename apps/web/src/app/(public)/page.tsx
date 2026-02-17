import { Process5 } from '@/components/sections/process'
import { FAQ5 } from '@/components/sections/faq'
import { Hero5 } from '@/components/sections/hero'
import { BenefitsHorizontal } from '@/components/sections/benefits'
import { Pricing5 } from '@/components/sections/pricing'
import { CTA } from '@/components/sections/cta'
import { WhatsIncluded } from '@/components/sections/whats-included'
import { HeroLogoMarquee } from '@/components/sections/logo-cloud'

/**
 * Marketing home page.
 */
export default function HomePage() {
    return (
        <>
            <Hero5 />
            <HeroLogoMarquee />
            <BenefitsHorizontal />
            <Process5 />
            <Pricing5 />
            <FAQ5 />
            <CTA />
        </>
    )
}
