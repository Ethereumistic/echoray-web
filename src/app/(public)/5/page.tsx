import { Hero5 } from "@/components/5/hero"
import { BenefitsHorizontal } from "@/components/5/benefits"
import { Process5 } from "@/components/5/process"
import { Pricing5 } from "@/components/5/pricing"
import { FAQ5 } from "@/components/5/faq"
import { CTA5 } from "@/components/5/cta"
import { MacbookScrollDemo } from "@/components/5/MacBook"
import { TimeCTA } from "@/components/5/time-cta"

export default function LandingPage5() {
    return (
        <>
            <Hero5 />
            <BenefitsHorizontal />
            <Process5 />
            <Pricing5 />
            <FAQ5 />
            {/* <CTA5 />
            <TimeCTA /> */}
            <MacbookScrollDemo />
        </>
    )
}
