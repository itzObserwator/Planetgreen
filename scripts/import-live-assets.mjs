// Download only media referenced in the audited source pages, then create light WebP copies.
// URLs and local destinations are recorded in research/live-page-assets.json.
import { readFile, mkdir, access } from "node:fs/promises";
import { dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
const exec = promisify(execFile);
const entries = Object.entries(
  JSON.parse(await readFile("research/live-page-assets.json", "utf8")),
);
let cursor = 0;
const failures = [];
async function worker() {
  while (cursor < entries.length) {
    const [url, destination] = entries[cursor++];
    try {
      if (!process.argv.includes("--refresh")) {
        try {
          await access("public" + destination);
          continue;
        } catch {}
      }
      const { stdout } = await exec("curl", ["-LsS", "--fail", "--max-time", "45", url], {
        encoding: "buffer",
        maxBuffer: 20 * 1024 * 1024,
      });
      await mkdir(dirname("public" + destination), { recursive: true });
      await sharp(stdout)
        .rotate()
        .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile("public" + destination);
    } catch (error) {
      failures.push({ url, error: error.message });
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`Imported ${entries.length - failures.length}/${entries.length} source images.`);
if (failures.length) {
  console.error(failures);
  process.exitCode = 1;
}
