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

## 5. 22 Backgrounds to Make Designs Less Flat (Anti-Flatness Texture & Depth Guide)

To escape sterile, flat digital canvases without creating noisy **AI Slop**, apply tactile textures, optical glass, or structured grids deliberately. Always maintain WCAG AA contrast (≥ 4.5:1), use `pointer-events: none`, and keep pattern opacities subtle (`0.02`–`0.08`) or masked at edges (`mask-image: radial-gradient(...)`):

| # | Technique | Visual Style & Depth Effect | Pure CSS / SVG Implementation Hint |
|---|---|---|---|
| 1 | **Felt texture** | Soft matte textile fiber warmth | Inline SVG `<feTurbulence>` fine grain + soft warm tint overlay |
| 2 | **Fluted glass** | Vertical ribbed optical refraction | Repeating linear-gradient strips + `backdrop-filter: blur(12px)` (great for songthaew cabin window glass) |
| 3 | **Thermal gradients** | Infrared heat-map color transitions | Multi-stop smooth radial gradient (strictly for budget alerts, never purple AI slop) |
| 4 | **Water ripples** | Concentric liquid light refractions | Subtle SVG displacement map or layered radial ring highlights |
| 5 | **Speckled graphite** | Fine metallic/graphite cabin enamel texture | Micro-dot radial pattern + SVG fractal noise (`opacity: 0.04`) over `--color-steel` |
| 6 | **Single-hue landscapes** | Layered monochrome depth planes | Layered SVG Doi Suthep silhouette in stepped opacities of `--color-red-deep` |
| 7 | **Blueprint grids** | Precision engineering grid lines | CSS `linear-gradient` 1px grid (`background-size: 24px 24px`) with radial fade mask |
| 8 | **Halftone** | Retro Thai transit signage print dots | CSS `radial-gradient(circle, currentColor 1px, transparent 1px)` staggered |
| 9 | **Grainy gradients** | Tactile painted-metal finish without flat plastic look | CSS radial gradient + SVG `feTurbulence` noise layer over `--color-red` |
| 10 | **Grass texture** | Organic natural directional fiber | Fine directional micro-stroke SVG pattern |
| 11 | **Dithered images** | 1-bit retro thermal-receipt dithering | Pre-dithered SVG/Canvas image filter for receipt previews |
| 12 | **Paper texture** | Authentic thermal slip & route-ticket fiber | Subtle SVG paper fiber noise (`baseFrequency="0.85"`) over slip preview panels |
| 13 | **Contour lines** | Topographic elevation / Chiang Mai route curves | Clean ultra-thin 1px SVG bezier contour curves (`opacity: 0.06`) |
| 14 | **Cloud sky** | Soft atmospheric depth with natural diffusion | Layered ultra-soft blurred radial ellipses at low opacity |
| 15 | **Pixel mosaics** | Structured color-stepped pixel blocks | Crisp `image-rendering: pixelated` low-res gradient grid |
| 16 | **Lens distortion** | Subtle optical edge vignette & light bending | Soft edge vignette + curved specular highlight arc |
| 17 | **Stippled gradients** | Hand-drawn stipple dot density fade | Variable-density SVG dot scatter or masked halftone fade |
| 18 | **Square-dot grids** | Crisp LED / split-flap matrix grid | CSS `radial-gradient` / `conic-gradient` 1.5px square dots behind odometer |
| 19 | **Blurred photos** | Ambient photographic color wash | Real photo with `filter: blur(48px) saturate(1.1)` + contrast scrim |
| 20 | **Iridescent shapes** | Subtle holographic bank-slip security sheen | Restrained `conic-gradient` specular highlight on verified slip badge |
| 21 | **Impressionist paintings** | Rich textured brushwork warmth | Softly blurred painterly color dabs under a translucent matte scrim |
| 22 | **ASCII and pixels** | Technical monospace character matrix & pixel art | Lightweight LED pixel matrix behind `route-board-demo.tsx` & `rolling-number.tsx` |

### Best Background Picks for SlipJot (Chiang Mai Red Songthaew)
* **#9 Grainy gradients & #5 Speckled graphite:** Gives the Songthaew body red (`--color-red: #b3121c`) and steel cabin (`--color-steel: #eef0f2`) a rich painted-metal enamel finish rather than flat digital blocks.
* **#8 Halftone & #12 Paper texture:** Vintage Thai bus-signage halftone dot shading on hero route boards + authentic thermal receipt paper texture inside `src/app/app/upload/page.tsx`.
* **#18 Square-dot grids & #22 ASCII and pixels:** Subtle mechanical LED/split-flap dot matrix behind `route-board-demo.tsx` and the odometer `rolling-number.tsx`.
* **#6 Single-hue landscapes / #13 Contour lines:** Optional ultra-subtle Doi Suthep / Chiang Mai road contour lines in `--color-red-deep` (`opacity: 0.08`) across the landing hero.

---

## 6. GPU Shader Background Architecture (Andres The Designer Workflow)

Reference Tutorial: **Shaders Tutorial: SICK Website Backgrounds** ([YouTube](https://www.youtube.com/watch?v=XVfUl8DB2D8)) & **Paper Shaders** ([shaders.paper.design](https://shaders.paper.design) / [shaders.com](https://shaders.com)).

Unlike heavy MP4 videos or CPU-laggy CSS blurs, **WebGL/Canvas Fragment Shaders** compute textured motion directly on the GPU at 60 FPS with minimal bundle footprint.

### 6.1 Implementation Paths in Next.js 16 + React 19
* **Option A — `@paper-design/shaders-react` (Recommended):**
  * Install `npm install @paper-design/shaders-react` and tune props visually on [shaders.paper.design](https://shaders.paper.design).
* **Option B — Zero-Dependency WebGL `<canvas>` Fragment Shader:**
  * Write a lightweight `'use client'` GLSL fragment shader (`u_time`, `u_resolution`, `u_colors`) with `ResizeObserver` and clean GPU resource disposal (`gl.deleteProgram`) on unmount.

### 6.2 Mandatory Next.js & Anti-AI-Slop Guardrails for Shaders
1. **`'use client'` + Static CSS Fallback:** Wrap shaders in a `'use client'` component layered over `--color-red` (`#b3121c`) / `--color-red-deep` (`#8e0e16`) so SSR renders instantly with zero CLS.
2. **Battery & Accessibility (`prefers-reduced-motion` + Offscreen Pause):** Set `speed={0}` when `prefers-reduced-motion` is enabled, and pause rendering via `IntersectionObserver` when scrolled out of view.
3. **Hero Body Red & Route-Board Frame Only:** Never place moving shaders behind Recharts budget graphs (`charts.tsx`), expense tables, or OCR slip dropzones (`upload/page.tsx`). Keep it on the Hero Songthaew body red section (`src/app/page.tsx`) with a soft contrast scrim so white Thai text stays crisp.
4. **Strict Songthaew Palette:** Use SlipJot's Body Red (`#b3121c`, `#8e0e16`, `#5e0a10`) and subtle Plate Gold (`#d9ab00`) tokens only—zero generic purple AI slop.

### 6.3 SlipJot Shader Recipe
```tsx
// src/components/songthaew-shader.tsx ('use client')
import { Dithering, GrainGradient } from '@paper-design/shaders-react';

// Painted metallic red songthaew enamel shader for the Landing Hero
<GrainGradient
  colorBack="#8e0e16"
  colors={["#b3121c", "#8e0e16", "#5e0a10", "#d9ab00"]}
  softness={0.6}
  intensity={0.42}
  noise={0.3}
  shape="wave"
  speed={reducedMotion || !isVisible ? 0 : 0.25}
  style={{ width: '100%', height: '100%' }}
/>
```
*(Optional LED route-board retro dithering inside `route-board-demo.tsx` frame: `<Dithering colorBack="#1b1715" colorFront="#f5c400" shape="warp" type="4x4" size={2} speed={0.18} />` at low opacity.)*

---

## 7. Token-Efficient Claude Prompts for SlipJot (Copy-Paste Ready)

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

### Prompt 3: Background & Songthaew Surface Depth (Anti-Flatness Without AI Slop)
```text
Role: Senior UI/UX Designer & Frontend Engineer
Task: Transform SlipJot's flat solid panels into tactile painted-metal, paper-slip, and LED route-board surfaces (`src/app/globals.css`, `src/app/page.tsx`, `src/app/route-board-demo.tsx`, `src/app/app/page.tsx`, and `src/app/app/upload/page.tsx`) using Section 5 ("22 Backgrounds to Make Designs Less Flat") with zero AI slop.

Requirements:
1. Hero Songthaew Body Red & Cabin Steel (`src/app/globals.css` & `src/app/page.tsx`):
   - Replace flat `--color-red` hero blocks with a #9 Grainy Gradient (subtle radial illumination from `--color-red` to `--color-red-deep` + inline SVG `<feTurbulence>` metallic paint enamel grain at 4% opacity).
   - Optionally frame the hero bottom edge with minimal #6 Single-Hue Landscape / #13 Contour Lines evoking Chiang Mai mountain curves in `--color-red-night` at 12% opacity (`pointer-events: none`).
   - Across `--color-steel` (`#eef0f2`) cabin dashboard backgrounds, apply subtle #5 Speckled Graphite brushed-steel noise (`opacity: 0.03`).
2. Route-Board & Odometer Matrix (`route-board-demo.tsx` & `rolling-number.tsx`):
   - Behind the split-flap route board and odometer readout, layer an ultra-subtle #18 Square-Dot Grid / #22 ASCII & Pixels LED matrix pattern (`opacity: 0.06`) with crisp #8 Halftone corner accents.
3. Receipt Upload Dropzone (`src/app/app/upload/page.tsx`):
   - Style the slip preview area with a #12 Paper Texture (`baseFrequency="0.85"`, `opacity: 0.035`) and an edge-only #20 Iridescent Shape specular verification border when OCR succeeds.
4. Guardrails:
   - Pure CSS + inline SVG data-URIs only (60 FPS mobile PWA performance).
   - Strictly preserve contrast >= 4.5:1 for `--color-on-red` (`#ffffff`) and `--color-ink` on `--color-plate` (`#f5c400`). Do not alter OCR, Drizzle, or Supabase logic.
```

### Prompt 4: Read Guide & Implement GPU Shader Background (SlipJot)
```text
Task: First, read `CLAUDE_DESIGN_GUIDE.md` thoroughly (especially Section 3 Anti-AI-Slop Rules, Section 4 Design Tokens, and Section 6 GPU Shader Background Architecture). Then follow the guide to implement a GPU Shader background on SlipJot's landing page (`src/app/page.tsx`).

Steps to Follow:
1. Create a reusable `'use client'` component `src/components/songthaew-shader.tsx` using `@paper-design/shaders-react` (`GrainGradient` from Section 6.3) or a zero-dependency WebGL `<canvas>` fragment shader.
2. Strictly bind to SlipJot's Chiang Mai Red Songthaew palette (`#b3121c` body red, `#8e0e16` red-deep, `#5e0a10` red-night, subtle `#d9ab00` plate highlight). Never introduce purple AI gradients.
3. Implement mandatory guardrails from Section 6.2:
   - Respect `prefers-reduced-motion` (`speed = 0`) and pause offscreen via `IntersectionObserver` to protect mobile PWA battery.
   - Layer behind the Hero Songthaew region only (`pointer-events-none`, `aria-hidden="true"`) with a subtle contrast scrim so white Thai display headings (`--color-on-red`) never clip or lose contrast (>= 4.5:1).
   - Never apply animated shaders behind `charts.tsx` or `upload/page.tsx` OCR previews.
4. Run `npm run build` / TypeScript check and verify mobile responsiveness without touching `@slipjot/slip-reader`, Drizzle, or Supabase logic.
```
