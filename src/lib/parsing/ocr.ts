import { createWorker } from "tesseract.js";

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const worker = await createWorker(["eng", "chi_tra"]);

  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text.replace(/[ \t]+/g, " ").trim();
  } finally {
    await worker.terminate();
  }
}
