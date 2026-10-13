// Generate the daylight texture from the original geography and ocean mask.
// Run before generate-earth-fallback.mjs after changing earth-palette.mjs.
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { gradeEarthPixels } from "../src/lib/earth-palette.mjs";
const [surface, mask] = await Promise.all(
  ["earth-color.jpg", "earth-specular.jpg"].map((file) =>
    readFile(new URL("../public/textures/" + file, import.meta.url)),
  ),
);
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage();
  // Only our own pure function is serialized; no external script is executed.
  await page.addScriptTag({ content: gradeEarthPixels.toString() });
  const jpeg = await page.evaluate(
    async (sources) => {
      const images = await Promise.all(
        sources.map(async (source) => {
          const image = new Image();
          image.src = source;
          await image.decode();
          return image;
        }),
      );
      const canvas = document.createElement("canvas");
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      const context = canvas.getContext("2d");
      context.drawImage(images[1], 0, 0, canvas.width, canvas.height);
      const mask = context.getImageData(0, 0, canvas.width, canvas.height);
      context.drawImage(images[0], 0, 0);
      const surface = context.getImageData(0, 0, canvas.width, canvas.height);
      window.gradeEarthPixels(surface.data, mask.data);
      context.putImageData(surface, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.94).split(",")[1];
    },
    [surface, mask].map((image) => "data:image/jpeg;base64," + image.toString("base64")),
  );
  await writeFile(
    new URL("../public/textures/earth-daylight.jpg", import.meta.url),
    Buffer.from(jpeg, "base64"),
  );
} finally {
  await browser.close();
}
