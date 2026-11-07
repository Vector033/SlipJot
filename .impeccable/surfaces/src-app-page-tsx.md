---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/app/page.tsx","src/app/login/page.tsx"]
---

# Surface brief: SlipJot web (landing + app)

Scope: landing `/` (Persuade), login, and the app under `/app` (Operate: dashboard, expenses, review, upload, settings). Mobile-first; desktop must hold.
Audience: Thai students and young workers on a phone (primary); recruiters opening the demo (secondary).
Action: landing → open the demo in one tap, or sign up; app → send slips, check the unsure ones, see the month.
Proof on hand: eval numbers in eval/results (synthetic slips, label as such), fictional demo data. No users, testimonials or press: never invent them.
Constraints: Thai text never clips (display line-height ≥1.25, body ≥1.6); WCAG 2.2 AA; reduced motion respected; app screens calmer than the landing.

## Direction contract

THESIS: Every slip is a passenger on a Chiang Mai red songthaew: it climbs on, the route board reads who it paid and how much, and it gets off at the right category stop without anyone telling the driver. Refuses the white-card fintech dashboard and the dark neon crypto look.

OWN-WORLD: Songthaew body red (#B3121C) owning whole regions, deep red for pressed and shadow, plate yellow (#F5C400) with warm ink (#1B1715) for every amount, a steel-light ground (#EEF0F2) with white route-board panels in the app, double chrome trim lines (light over dark hairline) as dividers. Category colours come from Chiang Mai's real songthaew route colours (red, yellow, blue, white-silver, green, orange, plus four more). Display: Chonburi, the looped heavy Thai sign-painter face, for the wordmark and landing headings. UI: Anuphan. Amounts: Barlow Semi Condensed, tabular, on plates. Icons: one stroke family (lucide), never emoji.

STORY: The visitor sees a slip turned into a categorised expense in front of them, understands that unsure reads get asked about instead of saved wrong, trusts that the image is deleted and only 4 account digits are kept, then opens the demo or signs up.

FIRST VIEWPORT: Full-bleed body red. Top: wordmark at left, เข้าสู่ระบบ at right. Left column: the Chonburi headline in white (2 lines, ~3.2rem mobile / 4.6rem desktop), one line of subcopy, then the working demo button (plate yellow, opens the demo account directly) and a secondary ghost link to sign up. Right column (stacked under on mobile): a synthetic slip (labelled) beside the route board, whose payee line is written on, amount plate rolls its digits, and destination stop lights up, once, then holds. Chrome trim closes the band.

FORM: Grounded candidate 7 of 7 (Chiang Mai songthaew route lettering), raised by Nixie (fixed digit positions, rolling digits), Lowbrow (red owns whole regions), Coptic (structure = data: review count lives in the nav), Multiplane (scroll travels stop by stop), Secession (content in the clearings, no nested cards). seed:3221a3ebe64bdfa8

Signature interaction: the route board read (payee write-on, plate digit roll, stop lights). Scroll grammar on the landing: a vertical route line whose stops fill as each section arrives. App motion: plate digits roll when a total changes; upload rows go reading → plate; nothing else moves.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Adaptations (recorded after the finish review)

- Headline sets in 3 lines (สลิปในอัลบั้ม / กลายเป็น / รายจ่ายเอง) instead of 2: Thai has no word spaces, and at the
  display size that keeps the board dominant the second line only breaks cleanly between whole words. Breaks are
  placed by hand (nowrap spans + `<wbr>`).
- The board's caption says "ตัวอย่างการทำงาน · ข้อมูลสมมติ": the values are authored, not read live.
