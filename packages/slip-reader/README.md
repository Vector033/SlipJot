# @slipjot/slip-reader

Thai bank transfer slip image in, validated JSON with per-field confidence out. Shared by SlipJot and HarnKan.

```ts
import { readSlip, normalizeThaiName } from "@slipjot/slip-reader";
import { sha256, dHash } from "@slipjot/slip-reader/image"; // Node only

const result = await readSlip(bytes, "image/jpeg"); // provider "auto": Gemini if GEMINI_API_KEY is set, else local OCR
result.amount;        // { value: 3866, confidence: 0.8 }
result.dateTime;      // { value: "2026-09-18T17:14:00+07:00", ... }  (Buddhist-era years converted)
result.receiver;      // { name, bank: "BAY", accountLast4: "7241" }  (never more than 4 digits)
result.needsReview;   // true when a key field is missing, implausible or low confidence
result.issues;        // Thai reasons for the UI, e.g. "อ่านวันเวลาไม่ได้"
```

## Providers

| provider | how | needs |
|---|---|---|
| `gemini` | Gemini vision with a JSON schema (`responseJsonSchema`), then our own date parser and rules | `GEMINI_API_KEY` (`GEMINI_MODEL` optional, default `gemini-flash-latest`) |
| `ocr` | tesseract.js (Thai + English) → rule parser (`parse.ts`) | nothing; language data downloads once to `TESSDATA_CACHE` or the OS temp dir |

The Gemini path uses only `fetch`/`btoa`, so it runs in any runtime. tesseract, sharp and jsQR are imported lazily.

## What the rules do

- Dates: Thai month abbreviations and full names, BE/CE years incl. 2-digit (`69` → 2026, `26` → 2026), OCR repairs (`n.y.` → ก.ย.).
- Amounts: label-aware (`จำนวน`, `ยอดโอน`, `Amount`), skips fees, glues OCR-split digits (`5, 541 .00`).
- Parties: each block ends with a masked account line; the name is the nearest line above it that isn't a bank or label.
- QR: the slip's mini QR (TLV) gives the transaction reference and sending bank. Used as a dedup key only. It does
  **not** verify the transfer with the bank.
- Validation (`validate.ts`) caps confidence for impossible values and sets `needsReview`. Model confidence is never
  trusted on its own.

## Tests and eval

```bash
npm test                                   # unit tests (root)
npm run eval:slips                         # accuracy per bank on the synthetic set, local OCR
npm run eval:slips -- --provider gemini    # same with Gemini
```
