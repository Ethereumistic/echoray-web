"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqCategories = [
    {
        title: "Before You Start",
        faqs: [
            {
                q: "How long does it take to build a website?",
                a: "Simple websites: 1-2 weeks. Advanced sites with e-commerce or custom features: 3-4 weeks. Custom systems: 4-8 weeks. We'll give you a clear timeline before starting.",
            },
            {
                q: "What do you need from me to get started?",
                a: "Basic information about your business, your logo (if you have one), and the content you want on your site. Don't worry if you're not sure — we'll guide you through it.",
            },
            {
                q: "Do I need to be technical?",
                a: "Not at all. We handle all the technical stuff. You just tell us what you want in plain language, and we make it happen.",
            },
        ],
    },
    {
        title: "Pricing & Payment",
        faqs: [
            {
                q: "Are there any hidden fees?",
                a: "No. The monthly price includes everything: hosting, security, updates, and support. The only extra cost would be if you want to add features outside your plan.",
            },
            {
                q: "Can I cancel my subscription?",
                a: "Yes, anytime. No contracts, no penalties. If you cancel, your site stays online — you just won't get updates or support anymore.",
            },
            {
                q: "What if I want to pay once instead of monthly?",
                a: "We offer one-time payment options too. Contact us and we'll give you a quote based on what you need.",
            },
        ],
    },
    {
        title: "After Launch",
        faqs: [
            {
                q: "How do I make changes to my website?",
                a: "You can either use the simple content manager we set up for you, or just email us your changes and we'll do it for you.",
            },
            {
                q: "What if something breaks?",
                a: "That's covered. We monitor your site and fix issues quickly. Most problems are handled before you even notice them.",
            },
            {
                q: "What happens if I outgrow my current plan?",
                a: "Easy — just upgrade to the next plan. Your site and all your content stays exactly the same, you just get access to more features.",
            },
        ],
    },
]

export function FAQ3() {
    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Straight answers to common questions
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        No jargon. No fine print. Just the facts.
                    </p>
                </motion.div>

                {/* FAQ by category */}
                <div className="max-w-4xl mx-auto space-y-12">
                    {faqCategories.map((category, categoryIndex) => (
                        <motion.div
                            key={category.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                        >
                            <h3 className="text-lg font-semibold text-primary mb-4">
                                {category.title}
                            </h3>
                            <Accordion type="single" collapsible className="space-y-3">
                                {category.faqs.map((faq, faqIndex) => (
                                    <AccordionItem
                                        key={faqIndex}
                                        value={`${categoryIndex}-${faqIndex}`}
                                        className="border border-border rounded-xl px-6 data-[state=open]:border-primary/50 transition-all"
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
                    ))}
                </div>
            </div>
        </section>
    )
}
