// Renders the PWA icons in public/ from one SVG. Run: node scripts/generate-icons.mts
// sharp writes no text chunks, so re-embed each icon's origin afterwards (impeccable embed-prompt <file>
// --prompt "origin: …"); DESIGN.md lists every shipped raster with its provenance.
// The mark: songthaew body red, a yellow licence plate with one jotted line, chrome trim.
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const out = (f: string) => fileURLToPath(new URL(`../public/${f}`, import.meta.url));

function svg(size: number, maskable: boolean) {
  // Maskable icons keep the mark inside the 80% safe zone and paint the whole square.
  const pad = maskable ? size * 0.2 : size * 0.12;
  const s = (size - pad * 2) / 32;
  const g = (x: number) => pad + x * s;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="#b3121c"/>
    <rect x="${g(4)}" y="${g(7)}" width="${24 * s}" height="${13 * s}" rx="${3 * s}" fill="#f5c400" stroke="#1b1715" stroke-width="${2 * s}"/>
    <path d="M${g(9)} ${g(13.5)}h${14 * s}" stroke="#1b1715" stroke-width="${2.6 * s}" stroke-linecap="round"/>
    <path d="M${g(2)} ${g(25)}h${28 * s}" stroke="#c8cdd3" stroke-width="${2.2 * s}"/>
    <path d="M${g(2)} ${g(26.8)}h${28 * s}" stroke="#8f969e" stroke-width="${0.9 * s}"/>
  </svg>`);
}

await sharp(svg(192, false)).png().toFile(out("icon-192.png"));
await sharp(svg(512, false)).png().toFile(out("icon-512.png"));
await sharp(svg(512, true)).png().toFile(out("icon-maskable-512.png"));
await sharp(svg(180, true)).png().toFile(out("apple-touch-icon.png"));
await sharp(svg(48, false)).png().toFile(out("favicon.png"));
console.log("icons written to public/");
