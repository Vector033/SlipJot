---
name: SlipJot
description: Thai slip-to-expense tracker dressed as a Chiang Mai red songthaew.
colors:
  red: "#d92d20"
  red-deep: "#b42318"
  red-night: "#7a1310"
  red-soft: "#fef2f2"
  on-red: "#ffffff"
  on-red-2: "#fff5f5"
  on-red-accent: "#fde68a"
  plate: "#f59e0b"
  plate-deep: "#d97706"
  plate-soft: "#fef3c7"
  ink: "#1e293b"
  ink-2: "#475569"
  ink-3: "#64748b"
  steel: "#f8fafc"
  steel-2: "#e2e8f0"
  chrome: "#cbd5e1"
  chrome-dark: "#94a3b8"
  panel: "#ffffff"
  line: "#e2e8f0"
  ok: "#15803d"
  warn: "#b45309"
  danger: "#b42318"
  route-food: "#e3730b"
  route-transport: "#b3121c"
  route-shopping: "#1f5fbf"
  route-housing: "#1f8a4c"
  route-bills: "#c79a00"
  route-education: "#6b3fa0"
  route-health: "#138a8a"
  route-entertainment: "#d23c7a"
  route-people: "#8f969e"
  route-other: "#7a5230"
typography:
  display:
    fontFamily: "Chonburi, Anuphan, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0em"
  headline:
    fontFamily: "Chonburi, Anuphan, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0em"
  title:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-lead:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.6
  plate:
    fontFamily: "Barlow Semi Condensed, Anuphan, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.15
    fontFeature: "\"tnum\" 1"
rounded:
  sm: "6px"
  plate: "0.4em"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "40px"
  section: "64px"
  section-lg: "80px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.on-red}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
  button-plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    height: "48px"
  button-plate-hover:
    backgroundColor: "{colors.plate-deep}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-ghost-red:
    backgroundColor: "{colors.red}"
    textColor: "{colors.on-red}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "48px"
  button-ghost-red-hover:
    backgroundColor: "{colors.red-deep}"
  button-danger:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.red-soft}"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  input-unsure:
    backgroundColor: "{colors.plate-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "36px"
  chip-on:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  plate:
    backgroundColor: "{colors.plate-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.plate}"
    rounded: "{rounded.plate}"
    padding: "0 0.45em"
  plate-sm:
    backgroundColor: "{colors.plate-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
  board:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  board-head:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    padding: "10px 20px"
    height: "48px"
  notice:
    backgroundColor: "{colors.plate-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  notice-over:
    backgroundColor: "{colors.red-soft}"
    textColor: "{colors.red-deep}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: SlipJot

## Overview

**Creative North Star: "The Red Songthaew"**

SlipJot is dressed as a Chiang Mai red songthaew, the shared pickup-truck bus. Every slip is a passenger: it climbs on, the route board reads who it paid and how much, and it gets off at its category stop. The truck's materials are the whole vocabulary: body red painted across whole regions, a yellow public-transport licence plate for every amount, double chrome trim between parts of the body, ink-black route-board title strips with white lettering, and the city's real route colours for categories. The display face is Chonburi, the looped heavy Thai sign-painter letter painted on route boards.

The landing is the side of the truck: full-bleed red, the headline in white and plate yellow, a working route board beside a synthetic slip, chrome trim closing the band. The app is the cabin: a steel-light ground with white route-board panels, a red header strip with chrome trim under it, and the same plate under every total. App screens are calmer than the landing; red narrows to the header, the primary action, charts and over-budget warnings. The world refuses the white-card fintech dashboard and the dark neon crypto look.

Light theme only. There is no dark mode yet; every token here is a light-theme value, and a dark theme would need its own pass rather than inverted tokens. Thai is the first language, so every typographic decision starts from Thai's stacked vowels and tone marks.

**Key Characteristics:**
- Body red owns whole regions; it is a surface, not a sprinkle.
- A soft amber plate (amber wash, 1px amber hairline) carries every headline amount, in condensed tabular digits.
- Double chrome trim (light line over a dark hairline) divides regions and board rows.
- Route boards: white panels with a white title row over a 1px hairline; no nested cards. No solid black bands anywhere in the app.
- Category colours are Chiang Mai's songthaew route colours.
- Thai never clips: headings at line-height 1.25 or more, body at 1.6.
- Motion is the route board's own: payee writes on, plate digits roll, the stop lights, rows flip over like a split-flap sign. Everything is visible by default.

## Colors

A transit palette: one saturated body red, one plate yellow, warm ink, and cool steel and chrome for the cabin.

### Primary
- **Songthaew Body Red** (red): the landing's first viewport, the login panel, the app header, the primary button, chart bars, the text caret, the theme colour and the icon ground. Pressed and hover states step down to **Pressed Red** (red-deep); **Night Red** (red-night) is the route board's interior on the landing. **Blush Red** (red-soft) backs danger hover and over-budget notices.
- **On-Red White and Rose** (on-red, on-red-2): text on red. Secondary text on red is rose tinted from the body, never grey.

### Secondary
- **Plate Yellow** (plate): every headline amount, the plate button, the lit chip, the selected stop, the review-count badge, the demo-account bar, focus outlines on red and ink grounds, and text selection. **Plate Shadow** (plate-deep) is its hover and the border of an unsure field; **Plate Wash** (plate-soft) backs unsure fields and neutral notices.

### Tertiary
- **Route Colours** (route-food through route-other): the default category colours, taken from Chiang Mai's songthaew routes (red city line, orange, blue, green, yellow, and more). Users may recolour categories; these are the starting set. They appear as category dots, icon tiles and chart segments, never as UI chrome.

### Neutral
- **Warm Ink** (ink): text, plate borders, board title strips, the selected chip's border, focused input borders.
- **Ink 2 / Ink 3** (ink-2, ink-3): secondary text and labels; tertiary text, placeholders, inactive mobile nav.
- **Steel** (steel): the app and landing-section ground. **Steel 2** (steel-2) backs neutral system notices.
- **Chrome / Chrome Dark** (chrome, chrome-dark): the two lines of the trim, the landing route line and unreached stops, scrollbars.
- **Panel White** (panel) and **Line** (line): board surfaces and input/button strokes.
- **Status** (ok, warn, danger): confirmed, unsure, destructive. Danger is the body red itself.

### Named Rules
**The Red Owns Regions Rule.** Red is painted as whole regions (full-bleed bands, the header strip, a login half) or as the single primary action. It is not used as a scattered accent on app screens.

**The Tinted-On-Red Rule.** Text on red is white or rose (on-red-2). Never grey on red. Amber accents and focus on red use on-red-accent (#fde68a): plate amber is only 2.3:1 there.

**The Plate Rule.** A headline amount or total sits on a soft amber plate (plate-soft fill, 1px plate-deep hairline, no ink border). Yellow is reserved for amounts, the lit stop, the plate action and focus; it is not a generic highlight.

## Typography

**Display Font:** Chonburi (with Anuphan, sans-serif)
**Body Font:** Anuphan (with system-ui, sans-serif)
**Plate Font:** Barlow Semi Condensed, tabular (with Anuphan)

**Character:** Chonburi is the painted route sign, loud and looped, used only for the wordmark and Persuade-surface headings. Anuphan is the plain modern Thai for everything read and tapped. Barlow Semi Condensed is the licence plate, condensed and tabular so digits hold fixed positions.

### Hierarchy
- **Display** (Chonburi 400, 2.5rem mobile to 3.75rem desktop, 1.25): the landing headline; login headline at 2rem to 3.2rem. White on red, second phrase in plate yellow.
- **Headline** (Chonburi 400, 1.875rem to 2.25rem, 1.25): landing section headings; empty-state headings in the app at 1.5rem.
- **Title** (Anuphan 700, 1.5rem, 1.3): app page titles. Board-strip titles are Anuphan 700 at 1rem.
- **Body** (Anuphan 400, 1rem, 1.6): all running text; landing lead copy at 1.125rem, measures 36ch to 52ch.
- **Label** (Anuphan 500, 0.875rem): field labels in ink-2, meta text, chips.
- **Plate** (Barlow Semi Condensed 600, tabular, 1.15): amounts on plates, from 1.6rem in the demo board to 3rem for the month total; list amounts use the plate face without the plate.

### Named Rules
**The No-Clip Rule.** Thai stacks marks above and below the line. Headings never go below line-height 1.25 (h1 to h3 default 1.3), body stays at 1.6, and letter-spacing on Thai stays 0.

**The Whole-Word Break Rule.** Thai has no word spaces, so display lines break by hand between whole words: each phrase in a nowrap span, a `<wbr>` where a break is allowed, `<br>` where one is required. Never let the browser break a Thai display line mid-word.

**The Tabular Digits Rule.** Every number that can change or be compared is tabular (`.num` or the plate face).

## Layout

Mobile first. Landing bands are full-bleed with content in a 72rem (max-w-6xl) container; landing sections sit in a 64rem container on a steel ground, 64px to 80px tall padding, two-column grids at the lg breakpoint (1024px) with 40px to 64px gaps, alternating text and evidence sides. A vertical chrome route line runs down the landing's left edge; each section is a stop whose dot fills plate yellow as it arrives.

The app is a 64rem column on steel with 16px (mobile) / 24px gutters and 20px gaps between boards; dashboards split 3fr/2fr at lg. The red header is sticky, 56px mobile / 64px from 640px, with chrome trim beneath. Below 768px the nav moves to a fixed white bottom bar of five 64px cells with a raised 56px plate button in the centre; content reserves 128px at the bottom for it. Touch targets are 44px minimum (36px for chips).

## Elevation & Depth

Depth is mostly material, not shadow: red regions, white boards on steel, ink strips and chrome trim separate things. Shadows are soft, ink-tinted and pulled under the object with a negative spread, like a panel bolted on rather than floating. There are no hard offset shadows.

### Shadow Vocabulary
- **Board rest** (`box-shadow: 0 1px 0 #dde1e6, 0 8px 24px -16px rgb(27 23 21 / 0.25)`): every route-board panel.
- **Plate lift** (`box-shadow: 0 6px 14px -8px rgb(27 23 21 / 0.45)`): the plate button and the raised mobile upload button.
- **Showpiece** (`box-shadow: 0 24px 48px -20px rgb(0 0 0 / 0.7)`): the landing's demo route board on red only.

### Surfaces
Flat fills get a material, kept faint (3 to 6% opacity, `pointer-events: none`) so text contrast never changes. Each one has one place:
- **Enamel** (`.songthaew-enamel`): body red with a soft sheen and paint grain, on every red region (landing bands, login half, app header).
- **Shader** (`SongthaewShader`, WebGL): a slow red enamel wave behind the landing hero only, over the enamel fill as its static fallback. It stops under reduced motion, when the hero is off screen or the tab is hidden, and if the context is lost. Never inside the app.
- **Contours** (`SongthaewContours`): thin Doi Suthep ridge lines at the foot of red bands, in the app header, and along the bottom of the cabin.
- **Cabin steel** (body background, `.steel-speckled`): steel with graphite speckle and a skylight wash at the top of the screen; the wash does not repeat down long pages.
- **Paper** (`.paper-texture`, `.paper-overlay`): receipt-paper fibre on boards and over slip thumbnails.
- **LED matrix** (`.led-matrix`, `.led-matrix-light`, `.halftone-corners`): a square-dot grid behind the route board, the month total and the odometer digits.
- **Fluted glass** (`.fluted-glass`): ribbed window glass on the bars that stay over content on phones: the bottom nav and the sticky confirm bar.
- **Iridescent edge** (`.iridescent-border`): a thin conic sheen around an upload thumbnail once its slip is saved. It is the only place a gradient touches the slip.
- **Thermal bars** (`.thermal-budget-near`, `.thermal-budget-over`): budget bars past 80% and over budget.
- **Danger hatch** (`.danger-stripe`): diagonal blush hatching behind destructive sections (wipe data, delete account).

Empty states carry a small line illustration of the songthaew (`SongthaewIllo`: truck, ledger, cleared). New textures need a job none of these does.

### Named Rules
**The Bolted-On Rule.** Shadows sit tight under their object with negative spread; nothing glows and nothing floats in a halo. The one exception is the landing demo's scan laser.

## Shapes

Friendly, pressed-metal corners. Controls and inputs use 12px; boards and notices 16px; the landing's privacy band 24px; chips and the category badge are full pills. Plates are 12px-radius soft amber badges with a 1px amber hairline and a faint warm shadow; the old ink double border is gone. Strokes are 2px everywhere on light grounds (inputs, secondary buttons, chips), and focus is a 3px outline at 2px offset: ink on the light cabin, on-red-accent on red, plate amber on ink and night-red grounds.

## Components

### Buttons
Tactile and solid; press moves the button down 1px.
- **Shape:** gently rounded (12px), 44px minimum height (48px for the plate and ghost-on-red buttons).
- **Primary (red):** white Anuphan 600 on body red, hover pressed red. The default action inside the app.
- **Plate:** ink Anuphan 700 on plate yellow with a 2px ink border and the plate-lift shadow, hover plate-deep. The one headline action per surface: the demo button, send slip, the desktop nav's upload.
- **Secondary:** white with a 2px line border, ink text, border turns ink on hover.
- **Ghost on red:** transparent on red with a rose 2px border, white text; hover fills pressed red and the border goes white.
- **Danger:** text-only body red, blush background on hover.

### Chips
- **Style:** white pill, 2px line border, ink-2 label at 0.875rem, 36px tall.
- **State:** the lit stop: selected chips turn plate yellow with an ink border and ink semibold text. On the red demo board, chips are 1px rose-outline pills and the lit one is plate.

### Cards / Containers (Route Boards)
- **Corner Style:** 16px.
- **Background:** panel white on steel.
- **Shadow Strategy:** board rest.
- **Title row:** 48px, white fading to #fafafa, ink Anuphan 700 title and ink-3 meta at right, a 1px hairline beneath. Amounts in it are ink, not amber.
- **Rows:** separated by a 2px chrome trim (light over dark hairline), not grey rules.
- **Internal Padding:** 20px. Boards are never nested inside boards.

### Inputs / Fields
- **Style:** white, 2px line border, 12px radius, 10px by 14px padding, ink text, ink-3 placeholder, red caret.
- **Focus:** border turns ink, plus the global ink focus outline for keyboard.
- **Unsure:** a field the reader was not sure about gets a plate-wash fill with a plate-deep border, and a warn-coloured note below.

### Navigation
- **Desktop (768px and up):** in the red header, Anuphan 600 links at 0.875rem in rose; active and hover fill pressed red with white text; upload is a compact plate button. The review count is a small plate badge, because it is work left to do.
- **Mobile:** a fixed white bottom bar with icon over label; active is body red with a 3px red tab at the top edge; upload is a raised 56px plate tile with an ink border.

### Plate (signature)
The licence plate holding an amount: soft amber wash, 1px amber hairline, Barlow Semi Condensed 600 tabular. The small plate (6px radius, no border) carries percentages and badges. When a total changes, digits roll like an odometer, each in a fixed-width column, rightmost settling last; separators and the baht sign stay still and screen readers get the plain value.

### Chrome Trim (signature)
A 4px strip: 2px chrome over a 1px chrome-dark hairline. It closes every red band (landing hero, app header) and divides board rows.

### Notices
16px-radius, 12px by 16px, 0.875rem. Plate wash for neutral confirmations, blush red with pressed-red text for over-budget and errors, steel-2 for system messages.

### Motion
All moves come from the route board and the slip reader:
- **Write-on:** the payee line writes on left to right (clip-path).
- **Roll:** plate digits roll (700ms plus 90ms per digit, cubic-bezier(0.16, 1, 0.3, 1)).
- **Stop lights:** the destination stop fills plate yellow. On the landing route line, a reached stop's dot fills plate yellow, turns its ring ink and grows to 110%.
- **Split-flap (landing demo only):** "สลิปถัดไป" turns each board row over from its top edge (rotateX, 380ms, 70ms stagger) onto the next sample, then the read plays. Only on tap; the board never cycles by itself.
- **Scan band:** while a slip is read, a flat plate-yellow band passes over upload thumbnails (no glow) back and forth until the read ends. On the landing demo it is a laser instead: a 3px plate-yellow line with a plate glow, sweeping down and back up the slip every 2.2s for as long as the demo is on screen, starting only once the board has scrolled into view (`.laser`, `@keyframes laser-scan`, transform only). Both are hidden under reduced motion. An upload thumbnail grows to 104px by 144px while it is read. Once slips are added, the upload drop zone shrinks to a one-row "เพิ่มสลิปอีก" bar so the slips being read stay on a phone screen.
- **Settle:** when a read lands, the amount plate and the saved/review badge settle in (scale from 0.82, slight overshoot, 320ms).
- **Sound (opt-in):** a soft split-flap tick when the demo board flips or a category chip is tapped, and a short tone when a slip finishes reading or is confirmed. Off by default; switched on in Settings.
Boards may rise 14px into place. Nothing else moves; reduced motion collapses all of it to an instant state, and every element is visible without animation. No scroll-jacking: lists and pages scroll natively.

Chart tooltips are small white cards with a 1px hairline: the label in ink-3 over the amount in ink. The daily bar chart has dashed horizontal gridlines, a baht Y axis on round steps (฿0, ฿500, ฿1k…), a hairline X baseline; past days are body red, today is plate amber (never ink), days still to come are steel-2.

### Imagery and Rasters
SlipJot ships no photography. Its rasters and their provenance:
- `public/demo/slip-sample.jpg`: a synthetic, fictional transfer slip (made-up names, accounts and reference) rendered by `scripts/generate-synthetic-slips.mts` with Playwright from the HTML in `scripts/synthetic-slips.mts`. It carries an embedded origin note and is always captioned as sample data (ข้อมูลสมมติ) where shown.
- `public/demo/slip-transport.jpg`, `slip-shopping.jpg`, `slip-housing.jpg`: the landing board's other samples, fictional, rendered by `scripts/generate-demo-slips.mts` from the same HTML, each with an embedded origin note.
- `public/icon-*.png`, `public/apple-touch-icon.png`, `public/favicon.png`: the authored vector mark (red body, plate with one jotted line, chrome trim) rendered by `scripts/generate-icons.mts` with sharp. Each carries an embedded origin note.
- Real slips are never shipped or committed. Any new raster must be authored or synthetic and carry its origin.

Icons are one stroke family (lucide), never emoji.

## Do's and Don'ts

### Do:
- **Do** paint red as whole regions (full-bleed bands, the header strip) and close each red band with chrome trim.
- **Do** put every headline amount on a plate: soft amber wash, 1px amber hairline, Barlow Semi Condensed 600, tabular.
- **Do** use white or rose (#fff5f5) for text on red, and #fde68a for amber on red.
- **Do** title route boards with the white title row and separate their rows with chrome trim.
- **Do** keep Thai headings at line-height 1.25 or more and body at 1.6, with letter-spacing 0.
- **Do** break Thai display lines by hand between whole words with nowrap spans and `<wbr>`.
- **Do** mark unsure fields with plate wash and a plate-deep border, and label sample data as ข้อมูลสมมติ.
- **Do** keep app screens calmer than the landing: motion only where a number or a read changes.

### Don't:
- **Don't** use grey text on red.
- **Don't** spend plate yellow on decoration; it means an amount, a lit stop, the headline action or focus.
- **Don't** nest boards inside boards.
- **Don't** use emoji as icons; use the single lucide stroke family.
- **Don't** let any element depend on animation to become visible.
- **Don't** ship a raster without recorded provenance, and never a real slip.
