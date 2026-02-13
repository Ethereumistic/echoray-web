import { Process5 } from '@/components/5/process'
import { FAQ5 } from '@/components/5/faq'
import { Hero5 } from '@/components/5/hero'
import { BenefitsHorizontal } from '@/components/5/benefits'
import { Pricing5 } from '@/components/5/pricing'
import { MacbookScrollDemo } from '@/components/5/MacBook'
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
            <MacbookScrollDemo />
        </>
    )
}
