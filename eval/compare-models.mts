// Compares several models on the local FreeLLMAPI router, one eval run per model, then writes
// a single comparison table. Synthetic, fictional data only (the slip eval refuses --dir).
//   npm run eval:compare                                   # slips, holdout set, default models
//   npm run eval:compare -- --set synthetic --limit 10
//   npm run eval:compare -- --models gemini-3.5-flash-lite,gemma-4-31b,qwen3.8-27b
//   npm run eval:compare -- --rpm 5 --rest 90          # slower pacing when a tier keeps answering 429
//   npm run eval:compare -- --task categorize --models gemini-3.5-flash-lite,typhoon-2.5-30b-a3b-instruct,gpt-oss-120b
// Needs FreeLLMAPI running on 127.0.0.1:31415 and FREELLMAPI_KEY in .env.local.

import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (name: string) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined);
const task = opt("task") ?? "slips";
const set = opt("set") ?? "holdout";
const limit = opt("limit");
// Free tiers rate-limit hard (most failures in a burst are 429s): pace calls and rest between models.
const rpm = opt("rpm") ?? "8";
const restMs = Number(opt("rest") ?? 60) * 1000;
const DEFAULT_MODELS =
  task === "slips"
    ? ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemma-4-31b", "gemma-4-26b-it", "qwen3.8-27b"]
    : ["gemini-3.5-flash-lite", "typhoon-2.5-30b-a3b-instruct", "gpt-oss-120b", "gemma-4-31b"];
const models = (opt("models") ?? DEFAULT_MODELS.join(",")).split(",").map((m) => m.trim()).filter(Boolean);

const root = fileURLToPath(new URL("../", import.meta.url));
const results = fileURLToPath(new URL("./results/", import.meta.url));
const fileSafe = (m: string) => m.replace(/[^a-z0-9.-]+/gi, "_");
const pct = (x: unknown) => (typeof x === "number" ? `${Math.round(x * 100)}%` : "–");

const rows: string[] = [];
for (const [i, model] of models.entries()) {
  if (i > 0) await new Promise((r) => setTimeout(r, restMs));
  console.log(`\n=== ${model} ===`);
  const script = task === "slips" ? "eval/run-slip-eval.mts" : "eval/run-categorize-eval.mts";
  const extra = [...(task === "slips" ? ["--set", set, ...(limit ? ["--limit", limit] : [])] : []), "--rpm", rpm];
  const run = spawnSync(
    process.execPath,
    ["--env-file-if-exists=.env.local", script, "--provider", "freellmapi", "--model", model, ...extra],
    { cwd: root, stdio: "inherit" },
  );
  if (run.status !== 0) {
    rows.push(`| ${model} | run failed (exit ${run.status}) |`);
    continue;
  }
  if (task === "slips") {
    const r = JSON.parse(await readFile(`${results}${set}-freellmapi-${fileSafe(model)}.json`, "utf8"));
    const all = r.summary.ALL ?? {};
    const routed = r.routedModels ? Object.keys(r.routedModels).map((k) => k.replace(/^local:/, "")).join(", ") : "–";
    rows.push(
      `| ${model} | ${r.slips} | ${r.failed ?? 0} | ${pct(all.keyFields)} | ${pct(all.amount)} | ${pct(all.dateTime)} | ${pct(all.receiverNameClose)} | ${pct(all.needsReview)} | ${pct(all.silentErrors)} | ${r.avgMs} | ${routed} |`,
    );
  } else {
    const r = JSON.parse(await readFile(`${results}categorize-freellmapi-${fileSafe(model)}.json`, "utf8"));
    rows.push(
      `| ${model} | ${r.llmCalls} | ${r.llmErrors} | ${pct(r.accuracyBySource?.llm)} | ${r.userCorrections} |`,
    );
  }
}

const header =
  task === "slips"
    ? `| model | slips | failed | key fields | amount | date+time | payee≈ | review | silent errors | avg ms | answered by |\n|---|---|---|---|---|---|---|---|---|---|---|`
    : `| model | LLM calls | errors | LLM accuracy | user corrections |\n|---|---|---|---|---|`;
const md = `# FreeLLMAPI model comparison (${task}${task === "slips" ? `, ${set} set` : ""})\n\nRun ${new Date().toISOString()}. Synthetic, fictional data only; free tiers, so cost is $0 but limits and latency vary by hour.\n\n${header}\n${rows.join("\n")}\n`;
const out = `${results}compare-${task}${task === "slips" ? `-${set}` : ""}.md`;
await writeFile(out, md);
console.log(`\n${md}\nwrote ${out}`);
