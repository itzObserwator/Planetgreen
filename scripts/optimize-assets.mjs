// Generate delivery assets while retaining the original photography and textures.
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
await mkdir("public/textures/cloud-bank", { recursive: true });
const clouds = [
  ["04", 754, 268, 541, 154],
  ["10", 833, 223, 305, 149],
  ["01", 1114, 207, 343, 172],
  ["08", 947, 239, 394, 170],
  ["03", 967, 207, 317, 209],
  ["07", 1014, 189, 170, 92],
];
for (const [id, left, top, width, height] of clouds)
  await sharp(`public/textures/reference/cloud-${id}.png`)
    .extract({ left, top, width, height })
    .webp({ lossless: true })
    .toFile(`public/textures/cloud-bank/cloud-${id}.webp`);
for (const file of await readdir("public/images")) {
  if (!/\.jpe?g$/i.test(file)) continue;
  await sharp(`public/images/${file}`)
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`public/images/${file.replace(/\.jpe?g$/i, ".webp")}`);
}
for (const name of ["events", "partners", "awards", "footer"])
  await sharp(`public/textures/reference/foliage-${name}.png`)
    .resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 70, alphaQuality: 60 })
    .toFile(`public/textures/reference/foliage-${name}.webp`);
await sharp("public/textures/earth-india-fallback.png")
  .resize({ width: 768 })
  .webp({ quality: 82, alphaQuality: 90 })
  .toFile("public/textures/earth-india-fallback.webp");

for (const name of ["events", "partners", "awards", "footer"])
  await sharp(`public/textures/reference/foliage-${name}.png`)
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 65, alphaQuality: 55 })
    .toFile(`public/textures/reference/foliage-${name}-mobile.webp`);
