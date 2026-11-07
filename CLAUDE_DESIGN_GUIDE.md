# CLAUDE_DESIGN_GUIDE: Modern Web Design, Motion System & Psychological Framework (SlipJot Edition)

> Master UI/UX, Songthaew Route Board Motion & Psychological Framework for Claude Code / Claude Chat.
> Synthesized from 6 World-Class Design Masterclasses (Apple, Stripe, byCrawford, Scrollcraft, MotionSites).

---

## 1. Synthesis of the 6 Design Masterclasses & Psychology

### 1.1 Psychological Architecture of Financial Applications (Sam Crawford)
1. **The 50ms Halo Effect (Chiang Mai Songthaew Identity):**
   * Financial apps often feel intimidating, dry, or suspicious.
   * SlipJot completely flips this script by anchoring its visual identity in the beloved **Chiang Mai Red Songthaew** (bold body red `--color-red: #b3121c`, yellow license-plate accents `--color-plate: #f5c400`, and mechanical route-boards). Users are instantly charmed and intrigued within 50ms.
2. **Cognitive Fluency & Expense Categorization:**
   * Nobody enjoys manually typing receipts. Cognitive fluency means removing input friction completely.
   * Uploading a slip must immediately surface three answers: *"How much? When? What category?"* with plate-yellow numbers that pop into view automatically.
3. **The Peak-End Rule & OCR Scanner Delight:**
   * **The Peak:** Dropping a slip and watching a **glowing laser scanner beam** (`@keyframes laserScan`) sweep across the receipt image, followed by amount and category chips popping in (`@keyframes popChip`).
   * **The End:** Looking at the monthly total on an **animated odometer counter** (`rolling-number.tsx`) that rolls up smoothly like a car speedometer.

### 1.2 Anti-AI Slop & Expressive Character (Mikey Website)
* **Never Settle for Default SaaS:** Do not turn SlipJot into a generic white SaaS dashboard. Retain the vintage steel-cabin panels, mechanical split-flap text tickers, and authentic songthaew route colors.
* **Multi-Pass Refinement:** Instruct Claude in scoped passes (Landing Route-Board -> Slip Upload Scanner -> Dashboard Odometer & Recharts).

### 1.3 The 60-30-10 Color Architecture (Chris Misterek)
* **60% Field:**
  * *Landing:* Deep body red `--color-red: #b3121c`.
  * *App Cabin:* Clean steel ground `--color-steel: #eef0f2` and paper white.
* **30% Structure & Panels:** Route-board ivory panels, deep ink typography `--color-ink: #1b1715`, and hairline steel borders.
* **10% Plate-Yellow Focal Accent:** `--color-plate: #f5c400` reserved strictly for currency values (Thai Baht), key metrics, and primary CTAs.

### 1.4 Kinetic Motion & Split-Flap Tickers (Nate Herk)
* **Mechanical Route-Board Ticker:** Destination panels flip with a satisfying split-flap tick animation (`@keyframes flipTick`).
* **Tactile Category Selectors:** Route-colored category pills compress on click (`active:scale-95`).
* **No Scrolljacking:** Infinite expense transaction lists scroll natively and smoothly on mobile browsers.

### 1.5 Interactive Prototyping & Motion Libraries (Viktor Oddy)
* **MotionSites.ai & GetDesign.ai Patterns:** Laser scanner beam animations, embossed license plate styling, and lightweight SVG transitions without bloated external dependencies.

---

## 2. Curated Resource Directory (from Masterclass Video Descriptions)

* **Scrollcraft by Nate Herk:** Agentic design workflow and scroll-driven page mechanics (`skool.com/ai-automation-society`).
* **byCrawford Premium Website Checklist & System (Sam Crawford):** Principles of cognitive fluency, halo effect engineering, and conversion architecture (`bycrawford.com/premium-website-checklist`).
* **MotionSites.ai & GetDesign.ai (Viktor Oddy):** Curated prompt library for interactive hero sections, 3D card depth, and motion recipes (`motionsites.ai`, `getdesign.ai`).
* **Design Rocket (`designrocket.io`):** Interactive web prototyping course and workflows.

---

## 3. Tailwind CSS v4 & Next.js 16 Motion Recipes for SlipJot

Add to `src/app/globals.css`:

```css
@keyframes laserScan {
  0% { top: 0%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

@keyframes flipTick {
  0% { transform: rotateX(90deg); opacity: 0; }
  100% { transform: rotateX(0deg); opacity: 1; }
}

@keyframes popChip {
  0% { transform: scale(0.6); opacity: 0; }
  80% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-laser {
  animation: laserScan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.animate-flip-tick {
  animation: flipTick 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-pop-chip {
  animation: popChip 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 4. Project-Specific Elevation Blueprint (SlipJot)

* **Current State:** Functional slip-reader and expense tracker with songthaew branding, but upload flow and chart reveals can be elevated into a cinematic experience.
* **Target Transformation:**
  1. **Mechanical Route Board:** Hero section features an interactive split-flap ticker alternating between sample expenses ("Nimman Dinner -> ฿120", "PTT Gas -> ฿800").
  2. **OCR Laser Scanner Beam:** Upload dropzone displays a gold laser scanner sweeping across uploaded slips while AI extracts data.
  3. **Odometer Rolling Numbers:** Total monthly expenses roll up smoothly in plate-yellow figures.
  4. **Animated Donut Charts:** Recharts category distribution animates smoothly on page load.

---

## 5. Token-Efficient English Prompts for Claude (Ready to Copy-Paste)

> **Pro-Tip for Saving Claude Tokens:** Using English prompts saves ~60% of tokenizer capacity, enabling Claude to write complete, bug-free components without interruption.

### Prompt 1: Landing Page & Route-Board Motion Design
```text
Task: Elevate the UI and motion design of SlipJot's landing page (`src/app/page.tsx`, `src/app/route-board-demo.tsx`, and `src/app/globals.css`).

Design System:
Chiang Mai Red Songthaew (body red `--color-red: #b3121c`, license plate yellow `--color-plate: #f5c400`, steel-light cabin panels, and authentic route colors).

Requirements:
1. `src/app/page.tsx` Hero Section (50ms Halo Effect):
   - Enhance the typographic balance of Thai headings with generous line heights to prevent character clipping.
   - Style the route board with an embossed metallic plate look (subtle 1px border highlight and deep drop shadow).
   - In `route-board-demo.tsx`, add a mechanical split-flap ticker animation (`animate-flip-tick`) that flips between sample expense routes.
2. Interactive Slip Scan Showcase:
   - Feature a demo slip preview showing a gold laser beam sweeping vertically (`animate-laser`) with numeric amount badges popping in (`animate-pop-chip`).
3. Micro-Interactions:
   - Primary CTA "Send Slip" (`btn-plate`): tactile spring click (`active:scale-95`).
   - Strictly no scrolljacking; full mobile PWA responsiveness.
```

### Prompt 2: Slip Upload Laser Scanner & Dashboard Odometer Polish
```text
Task: Elevate the UI and motion in SlipJot's upload flow (`src/app/app/upload/page.tsx`) and dashboard charts (`src/app/app/charts.tsx`, `src/components/rolling-number.tsx`).

Requirements:
1. `src/app/app/upload/page.tsx` (Laser Scanner Feedback):
   - Enhance the dropzone with a dashed red border that softly pulses when dragging files.
   - During AI extraction (OCR state), display the uploaded slip preview with an animated vertical laser scan beam (`animate-laser`) and status text: "AI is reading amount, timestamp, and receiver...".
   - When completed, smoothly pop in the extracted fields with green confirmation badges.
2. `src/app/app/charts.tsx` & `rolling-number.tsx`:
   - Enhance `rolling-number.tsx` to ensure smooth 60 FPS odometer roll-up for monthly totals.
   - Style Recharts tooltips like yellow license plates with bold black digits (`font-plate`).
   - Add animated stroke reveals for the category donut chart on mount.
```
