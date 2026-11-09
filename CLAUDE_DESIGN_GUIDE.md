# CLAUDE_DESIGN_GUIDE: Professional Web Design System & Anti-AI-Slop Framework (SlipJot Edition)

> Master UI/UX, Songthaew Motion & Anti-AI-Slop Engineering Guide for Claude Code / Claude Chat.
> Incorporates the 10 World-Class Reference Websites, the 20 Rules to Unslop AI Designs, and SlipJot's Iconic Chiang Mai Red Songthaew Design System.

---

## 1. Core Mandate: Professional Web Design Skills & Zero AI Slop

When generating or refactoring UI for **SlipJot**, Claude must strictly apply professional **Web Design Skills** and completely eliminate **AI Slop**:

* **Activate Real Web Design Skills:**
  * **Embrace the Iconic Chiang Mai Songthaew Identity:** Financial apps often feel dry or intimidating. SlipJot turns this upside down with an authentic tribute to the Chiang Mai Red Songthaew: bold body red (`--color-red: #b3121c`), steel-light cabin panels, and license plate yellow (`--color-plate: #f5c400`) carrying every monetary figure.
  * **Cognitive Fluency & Instant Expense Clarity:** Nobody enjoys manual receipt logging. Dropping a slip must immediately surface three answers: *"How much? When? What category?"* with plate-yellow numbers that pop into view automatically.
  * **The 60-30-10 Color Architecture:**
    * **60% Cabin Canvas & Steel:** Cabin panels (`--color-steel: #eef0f2`) and pure white panels (`--color-panel: #ffffff`).
    * **30% Body Red & Structure:** Songthaew Body Red (`--color-red: #b3121c`) owning hero regions/headers, and deep carbon typography (`--color-ink: #1b1715`).
    * **10% High-Energy Action Accents:** License Plate Yellow (`--color-plate: #f5c400`) dedicated exclusively to monetary sums and primary conversion actions.
  * **Kinetic Physics & The Peak-End Rule:**
    * **The Peak:** Dropping a slip and watching a **glowing laser scanner beam** (`@keyframes laserScan`) sweep across the receipt image, followed by amount and category chips popping into place (`@keyframes popChip`).
    * **The End:** Viewing monthly totals on an **animated odometer counter** (`rolling-number.tsx`) that rolls up smoothly like a vehicle speedometer.

* **Strict "Zero AI Slop" Prohibition:**
  * ❌ NO generic purple-to-blue linear gradients.
  * ❌ NO useless decorative badges (e.g. "✨ AI Smart Tracker").
  * ❌ NO random italicized words in expense categories.
  * ❌ NO unstyled, generic 3-card columns.
  * ❌ NO mismatched corner radii (must follow `inner = outer - padding`).
  * ❌ NO unformatted shifting numbers (must use `tabular-nums` / `font-plate`).
  * ❌ NO scrolljacking (mobile PWA must use native scrolling).

---

## 2. The 10 Masterclass Reference Websites (Study & Emulate)

Study these 10 industry-standard websites. Prompt Claude to take inspiration from their specific design principles and adapt them to SlipJot:

| # | Reference Domain | Real URL | Core Principle to Study & Emulate | Application to SlipJot |
|---|---|---|---|---|
| 1 | **Animations** | [apple.com](https://www.apple.com) | Hardware-accelerated narrative scroll, spring easing curves. | Smooth transition between slip upload, OCR scan, and monthly expense breakdown. |
| 2 | **Onboarding** | [duolingo.com](https://duolingo.com) | Low-friction progression, rewarding milestones, delightful feedback. | Instant "Drop your first slip" onboarding without upfront registration hurdles. |
| 3 | **UI Design** | [linear.app](https://linear.app) | Hairline borders, high density, keyboard shortcuts, clean dark/light UI. | Detailed expense history table, category tagging, and receipt preview drawer. |
| 4 | **Typography** | [pentagram.com](https://www.pentagram.com) | Disciplined font scales, signage typography, deliberate line-heights. | Typographic balance between Songthaew signage headings and plate-number digits. |
| 5 | **Minimalism** | [muji.com](https://www.muji.com) | Functional calm, unadorned utility, high breathing room. | Clean cabin dashboard layouts without distracting decorative clutter. |
| 6 | **Search & Filters** | [airbnb.com](https://airbnb.com) | Clean pill filter bars, instant feedback, interactive filter states. | Filter expenses by Songthaew route color categories (Food, Travel, Utility, Shopping). |
| 7 | **Art Direction** | [aesop.com](https://aesop.com) | High-trust editorial mood, bespoke tactile textures, storytelling. | Nostalgic Northern Thai transport aesthetic with embossed metal plates and route signs. |
| 8 | **Dashboards** | [notion.com](https://notion.com) | High-density information architecture, modular blocks, distraction-free. | Monthly budget overview, spending limits, and category distribution charts. |
| 9 | **Landing Page Layouts** | [stripe.com](https://stripe.com) | Gold-standard sectioning, interactive product demos, fluid responsive transitions. | SlipJot hero featuring a live interactive route-board and animated slip scanner demo. |
| 10 | **Micro-interactions** | [framer.com](framer.com) | Tactile spring physics, button compression, mechanical motion. | The mechanical split-flap ticker animation and the odometer numeric counter. |

---

## 3. The 20 Rules to Unslop AI Designs (Complete Checklist & Rules)

Every UI component generated by Claude must pass this 20-rule checklist:

1. **Delete filler badges:** Remove meaningless pill badges (e.g., "AI Powered", "Smart Vault"). Keep only functional badges (e.g., "Food & Beverage", "฿120.00", "Verified Slip").
2. **Drop redundant labels:** Eliminate obvious labels (e.g., instead of "Amount: ฿350.00", show a bold license plate carrying "฿350.00").
3. **Unitalicize random words:** Claude often italicizes random adjectives. Remove all random italics—use font weight or hierarchy instead.
4. **Mono only where needed:** Restrict monospace fonts strictly to bank transaction references and OCR raw data. Never use mono for body prose.
5. **Use a design system:** Always bind colors and typography to SlipJot's tokens (`--color-red`, `--color-plate`, `--color-steel`, `--color-panel`, `--color-ink`). Never hardcode random hex values.
6. **Show the actual product:** In hero sections, display an actual animated slip scan with numbers popping into a route board, not an abstract 3D graphic.
7. **Enlarge the main feature:** The Monthly Expense Total and the Laser Scanner are the stars—make them the primary focal points.
8. **Group with spacing:** Group receipt metadata using clean spacing (`gap-4`, `space-y-3`) rather than multiple nested card borders.
9. **Make headlines specific:** Replace generic AI copy ("Supercharge Your Personal Finances") with concrete value ("Log Thai bank slips in 2 seconds with automatic receipt OCR").
10. **Emphasize the CTA:** Make the primary button ("Upload Slip" or "Scan Slip") stand out with license plate yellow and spring compression (`active:scale-95`).
11. **Add an accent colour:** Use License Plate Yellow (`--color-plate: #f5c400`) dedicated exclusively to monetary amounts and primary CTAs.
12. **Keep icons consistent:** Use Lucide icons exclusively, with a uniform 1.5px or 2px stroke width across all components.
13. **Remove embellishments:** Strip away decorative background squiggles, random floating shapes, and blurry gradient blobs.
14. **Inner radius = outer – padding:** Enforce the nested radius formula: `rounded_inner = rounded_outer - padding`. (e.g. steel cabin card `rounded-xl` (12px) with `p-3` (12px) requires inner plate `rounded-xs` (2px) or `rounded-none`).
15. **Improve text contrast:** Secondary text (`--color-ink-2: #4a4440`) must maintain at least 4.5:1 contrast against steel/white panels.
16. **Wrap headlines properly:** Apply `text-wrap: balance` to headings and ensure generous Thai line-heights to prevent upper vowel and tone mark clipping.
17. **Align by eye, not pixels:** Visually center Thai Baht signs (฿) alongside large numerical figures rather than relying purely on text bounding boxes.
18. **Use tabular nums:** Apply `tabular-nums` / `font-plate` to all currency amounts, odometer counters, and Recharts tooltips so numbers never jitter.
19. **Add loading states:** Always implement a vertical laser scanning animation (`animate-laser`) and status indicator while the AI reads the slip.
20. **Animate useful feedback:** Pop in extracted receipt fields with spring easing (`@keyframes popChip`); roll up totals with odometer ease.

---

## 4. SlipJot Design Tokens & Motion Recipes

Add/verify in `src/app/globals.css`:

```css
@keyframes laserScan {
  0% { top: 0%; opacity: 0.8; }
  50% { top: 100%; opacity: 1; }
  100% { top: 0%; opacity: 0.8; }
}

@keyframes popChip {
  0% { transform: scale(0.85); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-laser {
  animation: laserScan 2.2s ease-in-out infinite;
}

.animate-pop-chip {
  animation: popChip 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 5. Token-Efficient Claude Prompts for SlipJot (Copy-Paste Ready)

### Prompt 1: Landing Page & Route-Board Motion Design
```text
Role: Senior UI/UX Designer & Frontend Engineer
Task: Elevate SlipJot's landing page (`src/app/page.tsx`, `src/app/route-board-demo.tsx`, and `src/app/globals.css`) according to its Chiang Mai Songthaew design system and anti-AI-slop rules.

Reference Websites:
- Stripe (stripe.com) for landing sectioning and interactive product showcase.
- Framer (framer.com) for mechanical motion and tactile interactions.
- Pentagram (pentagram.com) for signage typography balance.

Design Requirements:
1. Palette & Atmosphere:
   - Body Red (`--color-red: #b3121c`), License Plate Yellow (`--color-plate: #f5c400`), Steel Cabin (`--color-steel: #eef0f2`), and White Route Panels (`--color-panel: #ffffff`).
   - Specific Thai headline with `text-wrap: balance`: "จดค่าใช้จ่ายจากสลิปโอนเงิน อัตโนมัติใน 2 วินาที". Generous line-heights to prevent Thai vowel mark clipping.
2. Route-Board Demo Showcase:
   - In `route-board-demo.tsx`, style the route board with an embossed metallic plate look (1px border highlight and deep drop shadow).
   - Add mechanical split-flap ticker animation that flips between sample expense categories and amounts.
3. Interactive Slip Scan Demo:
   - Preview slip with gold laser beam sweeping vertically (`animate-laser`) and plate-yellow amount badges popping in (`animate-pop-chip`).
4. Anti-AI-Slop Checks:
   - All currency values must use `tabular-nums` / `font-plate`.
   - No generic purple gradients or filler badges. Follow nested radius formula `inner = outer - padding`.
5. Strictly no scrolljacking. Mobile PWA responsiveness.
```

### Prompt 2: Slip Upload Laser Scanner & Dashboard Odometer Polish
```text
Role: Senior Frontend Engineer
Task: Elevate SlipJot's upload flow (`src/app/app/upload/page.tsx`) and dashboard charts (`src/app/app/charts.tsx`, `src/components/rolling-number.tsx`).

Reference Websites:
- Linear (linear.app) for high-density tabular data and clear state machines.
- Framer (framer.com) for spring animation and tactile button compression.

Requirements:
1. `src/app/app/upload/page.tsx` (Laser Scanner Feedback):
   - Dropzone with dashed red border that softly pulses when dragging a slip.
   - During AI OCR extraction, display the slip preview with an animated vertical laser scan beam (`animate-laser`) and status: "กำลังอ่านยอดเงิน วันที่ และผู้รับ...".
   - When finished, smoothly pop in extracted fields with green confirmation badges (`animate-pop-chip`).
2. `src/app/app/charts.tsx` & `rolling-number.tsx`:
   - Enhance `rolling-number.tsx` with smooth 60 FPS odometer roll-up for monthly totals using `tabular-nums`.
   - Style Recharts tooltips like yellow license plates with bold black digits (`font-plate`).
   - Add animated stroke reveals for the category donut chart on mount.
3. Accessibility & Contrast:
   - WCAG AA contrast (>= 4.5:1) for all typography on steel and red panels.
   - Touch targets >= 44px on mobile devices.
```
