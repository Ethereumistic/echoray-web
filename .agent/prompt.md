# Prompt for AI Agent — echoray.io Landing Pages

You are a **senior product designer and frontend engineer**.  
Your task is to **design and implement high-converting landing pages** for **echoray.io**, a web development studio that builds **custom websites and digital systems**.

---

## Core Positioning (NON-NEGOTIABLE)

- echoray.io builds **web solutions**, not “tech stacks”
- We **do not mention frameworks, CMSs, databases, or tools** to clients
- Visitors must instantly understand:
  - “They make websites”
  - “From simple ones to very complex ones”
  - “Everything is custom and tailored to my needs”
- The message must be equally clear to:
  - a farmer
  - a business CEO
  - a 7-year-old child

---

## Brand Voice

- Clear
- Confident
- Human
- Zero jargon
- No elitism
- No trash-talking platforms or tools
- We **adapt to the client**, not the other way around

---

## What We Sell (Explain Visually & Simply)

### Subscription Plans

#### €99 / month
- Simple websites
- Personal, portfolio, corporate, service-based sites
- Focus: presence, clarity, trust

#### €299 / month
- Advanced websites
- E-commerce, user accounts, dashboards, maps, shops, automation
- Focus: interaction, growth, functionality

#### Custom monthly deal
- Fully custom systems
- Tailored to the client’s business workflow
- Focus: scale, efficiency, automation

---

### One-Time Payment Option

- Available for clients who don’t want subscriptions
- Must feel equally premium and supported

---

### What Must NOT Be Mentioned

- CMS
- Frameworks
- Databases
- WordPress, Shopify, or alternatives
- Any technical implementation details

# These are more technical and not necessary for the client to know from the landing page,
# they will be explained later in the sales process if the client is interested. We can make exceptions
# for terms that are widely knows like "e-commerce" or "user accounts", or "content management systems",
# if it helps the client understand what we do. But as a general rule, avoid technical terms.

---

## UX & Conversion Goals

- The site must:
  - Instantly communicate what we do
  - Guide visitors through **clarity → trust → decision**
  - Make pricing feel simple and fair
- Strong hero sections
- Clear explanations using **plain language**
- Obvious CTAs
- Perfectly usable on **desktop and mobile**

---

## Signature Animation System (IMPORTANT)

Use **Framer Motion v12.26.1**

Define and apply a **signature motion language**:
- Subtle entrance animations (opacity + translate)
- Directional flow that guides reading
- Smooth hover feedback
- Section-to-section rhythm

Animations must:
- Feel premium
- Never distract
- Reinforce structure and clarity

Mobile animation rules:
- Lightweight
- Performance-safe
- Never overwhelming

---

## Technical Constraints (Implementation Only — Not Visible to Users)

- Next.js **15.5.9** (App Router)
- TypeScript
- React **19.1.4**
- Tailwind CSS v4 + **shadcn/ui**
- Convex database
- Cloudflare Workers via `opennextjs/cloudflare@1.14.8`
- A **custom shadcn theme already exists in `globals.css`**
  - Do **not** redefine colors, spacing, fonts, radius, or shadows
  - Use existing theme tokens only

---

## Deliverables

### 1️⃣ Primary Landing Page

Implement a **production-ready landing page** at:

`/src/app/(public)/1`

### 2️⃣ Additional Landing Page Designs

Create **FOUR additional, fully distinct landing pages** at:

`/src/app/(public)/2`
`/src/app/(public)/3`
`/src/app/(public)/4`
`/src/app/(public)/5`


Each page must:
- Use a **different layout philosophy**
- Have a different hero treatment
- Present pricing differently
- Use different animation emphasis
- Target a **different buyer mindset**
- Avoid repeating design structure or logic

---

### 3️⃣ Component Organization

Store components in:
`/components/1`
`/components/2`
`/components/3`
`/components/4`
`/components/5`


Requirements:
- Clean architecture
- Scalable structure
- Production-quality code
- No duplicated logic

---

## Responsiveness (CRITICAL)

- Must be flawless on:
  - Mobile
  - Tablet
  - Desktop
- No layout hacks
- No broken animations on small screens

---

## Output Rules

- **Code only**
- No explanations
- No placeholders
- No TODOs
- Ready to deploy
- Think like a real agency shipping a real product

---

## End Goal

echoray.io should feel:
- Understandable in **5 seconds**
- Trustworthy in **30 seconds**
- Hard to say no to after **2 minutes**
