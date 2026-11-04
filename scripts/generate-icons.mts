// Renders the PWA icons in public/ from one SVG. Run: node scripts/generate-icons.mts
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const out = (f: string) => fileURLToPath(new URL(`../public/${f}`, import.meta.url));

// Receipt with a torn edge, three "jotted" lines.
const glyph = (scale: number, offset: number) => `
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="M7 3h18v26l-3-2-3 2-3-2-3 2-3-2-3 2z" fill="#0f766e"/>
    <path d="M11 11h10M11 16h10M11 21h6" stroke="#fde68a" stroke-width="2.4" stroke-linecap="round"/>
  </g>`;

function svg(size: number, maskable: boolean) {
  const pad = maskable ? size * 0.22 : size * 0.1;
  const scale = (size - pad * 2) / 32;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="#f6f4ee"/>
    ${glyph(scale, pad)}
  </svg>`);
}

await sharp(svg(192, false)).png().toFile(out("icon-192.png"));
await sharp(svg(512, false)).png().toFile(out("icon-512.png"));
await sharp(svg(512, true)).png().toFile(out("icon-maskable-512.png"));
await sharp(svg(180, true)).png().toFile(out("apple-touch-icon.png"));
await sharp(svg(48, false)).png().toFile(out("favicon.png"));
console.log("icons written to public/");
