// Local Thai + English OCR with tesseract.js. The first run downloads the language
// data (~2 MB tha + eng) from the jsDelivr CDN into TESSDATA_CACHE (or the OS temp dir).
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createWorker, type Worker } from "tesseract.js";
import type { OcrLine } from "../parse.ts";
import { preprocessForOcr } from "./image.ts";

let workerPromise: Promise<Worker> | null = null;

function getWorker() {
  workerPromise ??= createWorker(["tha", "eng"], 1, {
    cachePath: process.env.TESSDATA_CACHE || join(tmpdir(), "slipjot-tessdata"),
  }).catch((err) => {
    workerPromise = null;
    throw err;
  });
  return workerPromise;
}

// tesseract has one worker; serialise calls so concurrent uploads queue instead of failing.
let queue: Promise<unknown> = Promise.resolve();

export async function ocrLines(image: Uint8Array): Promise<OcrLine[]> {
  const run = queue.then(async () => {
    const worker = await getWorker();
    const png = await preprocessForOcr(image);
    const { data } = await worker.recognize(png, {}, { blocks: true, text: false });
    const lines: OcrLine[] = [];
    for (const block of data.blocks ?? []) {
      for (const para of block.paragraphs) {
        for (const line of para.lines) {
          const text = line.text.trim();
          if (text) lines.push({ text, confidence: line.confidence / 100 });
        }
      }
    }
    return lines;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function terminateOcr() {
  if (!workerPromise) return;
  const w = await workerPromise;
  workerPromise = null;
  await w.terminate();
}
