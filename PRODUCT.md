# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** Thai students and young working people who pay almost everything by mobile banking and PromptPay and want to know where their money goes. They use SlipJot on a phone, usually right after paying or in a batch at the end of the day or week, with slips already sitting in the photo album. The first user is the owner (a CMU computer-science student).
- **Secondary:** recruiters and reviewers looking at the owner's portfolio. They arrive at the landing page, open the shared demo account (fictional data), and look around for a few minutes.

Priority confirmed 2026-11-05: real users first, recruiters second.

## Product Purpose

Turn the transfer slips people already have into an expense log without typing. SlipJot reads each slip (amount, date and time, payee, bank, last 4 account digits, memo), sorts it into a category, catches duplicates, and shows the month: total, categories, top payees, and budget warnings. Success means the owner keeps using it daily for weeks, and a visitor understands the value within one screen and can try it in one tap.

## Positioning

- Reads Thai bank slips from every major bank, with per-field confidence. Anything uncertain goes to a review queue instead of being saved wrong ("silent errors 0%" on the eval sets).
- Hybrid categorisation: learned payee rules and keywords first, the LLM only for unknown payees. Each payee costs at most one model call, ever.
- Privacy by default: slip images are deleted once confirmed (or after 7 days), and only the last 4 account digits are stored.

## Operating Context

- Mobile-first PWA. Slips come from the photo album (multi-select) or the Android share sheet straight from a banking app.
- Flows: upload → automatic save or review queue → dashboard by month → edit an expense (which teaches a rule) → budgets per category → CSV export.
- Thai Buddhist-era dates and baht amounts are everyday data. Thai text with tone marks and above/below vowels must never clip.

## Capabilities and Constraints

- Next.js 16 App Router, Tailwind CSS 4, Supabase Auth + Postgres (schema `slipjot`, shared hosted project with HarnKan), Drizzle, Recharts, Gemini Flash-Lite with local Thai OCR fallback. Deployed on Vercel at https://slipjot.vercel.app.
- It does not verify slips with banks, does not connect to bank accounts, and gives no financial advice (only the user's own statistics). The UI must never imply otherwise.
- Shared demo account with fictional data. It cannot delete itself or wipe its data.

## Brand Commitments

- Name: **SlipJot**. Everything else (logo, colours, typography) may change (confirmed 2026-11-05).
- Copy is Thai-first. English appears only for numbers, bank names and technical terms where users expect it.

## Evidence on Hand

- Eval results in `eval/results/` (synthetic, fictional slips only): local OCR 93–95% key fields, Gemini Flash-Lite 100%, 0% silent errors; categoriser avoids the LLM on 96.6% of a simulated 90-day stream.
- Fictional demo data from `scripts/seed-demo.mts`; screenshots in `docs/screenshots/`.
- No real users, testimonials, press or usage numbers yet. Do not invent them.

## Product Principles

1. Never silently wrong: when unsure, ask the user rather than save a guess.
2. Zero typing in the common case; one tap to fix the rest.
3. The user's money data is private by default and theirs to export or delete.
4. Show the user's own numbers plainly; no advice, no judgement.

## Accessibility & Inclusion

WCAG 2.2 AA: contrast, keyboard use, visible focus, respects reduced motion, works with large phone text sizes, and Thai glyphs never clipped by tight line-height.
