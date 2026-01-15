"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does the subscription service work?",
    answer:
      "After you subscribe, our team starts working on your website. You receive a first version within 7 business days. Everything is included - design, content, hosting and support.",
  },
  {
    question: "What happens if I am not satisfied with the design?",
    answer:
      "We work with feedback and corrections to get a site that you will be proud of. After we present you with the first version, you can send us notes by email. Up to 2 rounds of corrections are included within the initial phase. If after these revisions you are still not satisfied, you have the option to: cancel the subscription or pay extra for additional corrections and revisions. In the event of a cancellation of the subscription, we do not refund the paid monthly installment.",
  },
  {
    question: "How long does it take to create?",
    answer:
      'The first version of your site is ready within 7 business days (this applies only to "Starter Website") after subscribing and providing the necessary content on your part. Then we refine and finalize.',
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes. With our monthly plans, you can cancel at any time. There are no long-term contracts, hidden fees, or commitments. If you have chosen an annual plan, you can also cancel at any time, but the amount is non-refundable.",
  },
  {
    question: "What if I already have a website?",
    answer:
      "We can redesign it and migrate it to a new, faster, and more modern platform - without interruption to its operation.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book a consultation or subscribe and we will guide you to a short form and content instructions. From there, we take care of everything.",
  },
]

export function FAQ() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Everything you need to know about our services and how we work
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-semibold">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
