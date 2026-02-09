"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
    {
        q: "What exactly do I get for €99/month?",
        a: "A professionally designed website, mobile-friendly, with hosting, security, and support all included. You also get a simple content manager to update text and images yourself. No extra fees.",
    },
    {
        q: "How fast can my website be ready?",
        a: "Most websites launch within 7 business days. More complex projects take 2-4 weeks. We'll give you a realistic timeline before starting.",
    },
    {
        q: "What if I need to cancel?",
        a: "No problem. Cancel anytime with no penalties. Your website stays online — you just won't receive updates or support anymore.",
    },
    {
        q: "Is there a contract or commitment?",
        a: "No contracts. It's month-to-month. If you want to stop, just let us know before your next billing date.",
    },
    {
        q: "Can I switch plans later?",
        a: "Yes, upgrade or downgrade anytime. The change takes effect immediately and we prorate your billing.",
    },
    {
        q: "Do you offer one-time payments?",
        a: "Yes. If you prefer to own your website outright without monthly fees, we offer one-time payment options. Contact us for a quote.",
    },
]

export function FAQ5() {
    return (
        <section className="py-24 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
                    {/* Left column - Header */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:sticky lg:top-24"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Common questions
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8">
                            Still have questions? We&apos;re here to help.
                            Email us anytime or book a free call.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="mailto:hello@echoray.io"
                                className="text-primary font-semibold hover:underline"
                            >
                                hello@echoray.io
                            </a>
                        </div>
                    </motion.div>

                    {/* Right column - FAQ */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border border-border rounded-xl px-6 bg-card data-[state=open]:border-primary/50 transition-all"
                                >
                                    <AccordionTrigger className="text-left font-semibold py-5 hover:no-underline">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
