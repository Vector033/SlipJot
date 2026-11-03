// Measures slip-reading accuracy per bank.
//   npm run eval:slips                         # local OCR on the synthetic set
//   npm run eval:slips -- --provider gemini    # needs GEMINI_API_KEY
//   npm run eval:slips -- --dir D:/private-slips   # your own labelled slips, kept outside the repo
//
// A labelled folder holds images plus labels.json in the shape scripts/synthetic-slips.mts writes.
// Only aggregate scores and per-slip pass/fail flags are saved. Extracted values are printed to the
// console for debugging and never written to disk, so running this on real slips leaks nothing into git.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeThaiName, readSlip, type SlipReadResult } from "../packages/slip-reader/src/index.ts";
import { terminateOcr } from "../packages/slip-reader/src/image.ts";
import type { SyntheticSlip } from "../scripts/synthetic-slips.mts";

const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const provider = (opt("provider") ?? "ocr") as "ocr" | "gemini" | "auto";
const defaultDir = fileURLToPath(new URL("./fixtures/synthetic/", import.meta.url));
const dir = opt("dir") ?? defaultDir;
const limit = Number(opt("limit") ?? Infinity);
// Synthetic slips are dated in the ~60 days before this; real slips use today.
const now = dir === defaultDir ? new Date("2026-11-04T12:00:00+07:00") : new Date();

type Label = SyntheticSlip & { file: string };
const labels: Label[] = JSON.parse(await readFile(join(dir, "labels.json"), "utf8")).slice(0, limit);

const squash = (s: string | null | undefined) => (s ? normalizeThaiName(s).replace(/\s+/g, "") : null);

function similarity(a: string, b: string) {
  const x = [...a];
  const y = [...b];
  const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 1; j <= y.length; j++) d[0][j] = j;
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
  return 1 - d[x.length][y.length] / Math.max(x.length, y.length, 1);
}

const FIELDS = [
  "amount",
  "dateTime",
  "receiverName",
  "receiverNameClose",
  "receiverBank",
  "receiverLast4",
  "senderName",
  "senderLast4",
  "reference",
  "memo",
  "keyFields",
] as const;
type FieldName = (typeof FIELDS)[number];

function score(label: Label, r: SlipReadResult): Record<FieldName, boolean> {
  const rn = squash(r.receiver.name.value);
  const ln = squash(label.receiver.name)!;
  const s = {
    amount: r.amount.value === label.amount,
    dateTime: r.dateTime.value?.slice(0, 16) === label.dateTime.slice(0, 16),
    receiverName: rn === ln,
    receiverNameClose: rn !== null && similarity(rn, ln) >= 0.85,
    receiverBank: r.receiver.bank.value === label.receiver.bank,
    receiverLast4: r.receiver.accountLast4.value === label.receiver.last4,
    senderName: squash(r.sender.name.value) === squash(label.sender.name),
    senderLast4: r.sender.accountLast4.value === label.sender.last4,
    reference: r.reference.value === label.reference,
    memo: (r.memo.value ?? null) === (label.memo ?? null),
    keyFields: false,
  };
  // What an expense needs: how much, when, to whom (a near-miss name is fine for categorising).
  s.keyFields = s.amount && s.dateTime && s.receiverNameClose;
  return s;
}

type Row = { file: string; bank: string; scores: Record<FieldName, boolean>; needsReview: boolean; ms: number; costUsd: number };
const rows: Row[] = [];

for (const label of labels) {
  const image = await readFile(join(dir, label.file));
  const mime = extname(label.file).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
  let result: SlipReadResult;
  try {
    result = await readSlip(new Uint8Array(image), mime, { provider, now, decodeQr: true });
  } catch (err) {
    console.error(`✗ ${label.file}: ${(err as Error).message}`);
    continue;
  }
  const scores = score(label, result);
  rows.push({
    file: label.file,
    bank: label.layout,
    scores,
    needsReview: result.needsReview,
    ms: result.elapsedMs ?? 0,
    costUsd: result.usage?.costUsd ?? 0,
  });
  const misses = FIELDS.filter((f) => !scores[f]);
  if (misses.length) {
    console.log(`${label.file}: missed ${misses.join(", ")}${result.needsReview ? " (flagged for review)" : ""}`);
    for (const f of misses) {
      const got =
        f === "amount" ? result.amount.value
        : f === "dateTime" ? result.dateTime.value
        : f.startsWith("receiverName") ? result.receiver.name.value
        : f === "receiverBank" ? result.receiver.bank.value
        : f === "receiverLast4" ? result.receiver.accountLast4.value
        : f === "senderName" ? result.sender.name.value
        : f === "senderLast4" ? result.sender.accountLast4.value
        : f === "reference" ? result.reference.value
        : f === "memo" ? result.memo.value
        : null;
      if (f !== "keyFields" && f !== "receiverNameClose") console.log(`   ${f}: got ${JSON.stringify(got)}`);
    }
  }
}
await terminateOcr();

const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : "–");
const groups = new Map<string, Row[]>();
for (const r of rows) groups.set(r.bank, [...(groups.get(r.bank) ?? []), r]);
groups.set("ALL", rows);

const summary: Record<string, Record<string, number | string>> = {};
const header = ["bank", "n", "amount", "date+time", "payee", "payee≈", "payee bank", "payee last4", "ref", "key fields", "review", "silent errors"];
const lines = [`| ${header.join(" | ")} |`, `|${header.map(() => "---").join("|")}|`];
for (const [bank, rs] of groups) {
  const n = rs.length;
  const c = (f: FieldName) => rs.filter((r) => r.scores[f]).length;
  // The number that matters most: wrong key fields that were NOT flagged for review.
  const silent = rs.filter((r) => !r.scores.keyFields && !r.needsReview).length;
  const review = rs.filter((r) => r.needsReview).length;
  summary[bank] = {
    n,
    ...Object.fromEntries(FIELDS.map((f) => [f, c(f) / n])),
    needsReview: review / n,
    silentErrors: silent / n,
  };
  lines.push(
    `| ${bank} | ${n} | ${pct(c("amount"), n)} | ${pct(c("dateTime"), n)} | ${pct(c("receiverName"), n)} | ${pct(c("receiverNameClose"), n)} | ${pct(c("receiverBank"), n)} | ${pct(c("receiverLast4"), n)} | ${pct(c("reference"), n)} | ${pct(c("keyFields"), n)} | ${pct(review, n)} | ${pct(silent, n)} |`,
  );
}

const avgMs = rows.reduce((a, r) => a + r.ms, 0) / Math.max(rows.length, 1);
const cost = rows.reduce((a, r) => a + r.costUsd, 0);
const table = lines.join("\n");
console.log(`\nprovider=${provider} slips=${rows.length} avg ${Math.round(avgMs)} ms/slip, cost $${cost.toFixed(4)} total ($${(cost / Math.max(rows.length, 1)).toFixed(5)}/slip)\n`);
console.log(table);

const outDir = fileURLToPath(new URL("./results/", import.meta.url));
await mkdir(outDir, { recursive: true });
const tag = dir === defaultDir ? "synthetic" : "private";
await writeFile(
  join(outDir, `${tag}-${provider}.json`),
  JSON.stringify(
    {
      provider,
      set: tag,
      ranAt: new Date().toISOString(),
      slips: rows.length,
      avgMs: Math.round(avgMs),
      costUsdPerSlip: cost / Math.max(rows.length, 1),
      summary,
      perSlip: tag === "synthetic" ? rows.map(({ file, scores, needsReview }) => ({ file, scores, needsReview })) : undefined,
    },
    null,
    2,
  ) + "\n",
);
await writeFile(join(outDir, `${tag}-${provider}.md`), `provider: ${provider}, slips: ${rows.length}, avg ${Math.round(avgMs)} ms/slip\n\n${table}\n`);
