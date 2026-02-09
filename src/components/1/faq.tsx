"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
    {
        question: "How long does it take to build a website?",
        answer: "Most websites are ready within 1-2 weeks after you provide your content. More complex systems may take 3-6 weeks. We'll give you a clear timeline before starting.",
    },
    {
        question: "Do I need technical knowledge?",
        answer: "Not at all. We handle everything technical. You just tell us what you need in plain language, review what we create, and we take care of the rest.",
    },
    {
        question: "What's included in the monthly price?",
        answer: "Hosting, security updates, small changes and tweaks, and support. Your site stays fast, secure, and up-to-date without you lifting a finger.",
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes. Monthly plans have no long-term contracts. If you want to stop, just let us know before your next billing date.",
    },
    {
        question: "What if I already have a website?",
        answer: "We can redesign and rebuild it, or migrate it to a better platform. We'll make sure everything transfers smoothly without downtime.",
    },
    {
        question: "How do I update my website content?",
        answer: "You get access to a simple content manager where you can change text and images yourself. Or just email us your changes and we'll update it for you.",
    },
]

export function FAQ1() {
    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Got questions?
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Here are answers to the most common ones.
                        </p>
                    </motion.div>

                    {/* FAQ accordion */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border border-border rounded-2xl px-6 data-[state=open]:border-primary/50 data-[state=open]:shadow-lg transition-all"
                                >
                                    <AccordionTrigger className="text-left text-lg font-semibold py-6 hover:no-underline">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                        {faq.answer}
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
