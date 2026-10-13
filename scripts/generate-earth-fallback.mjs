// Regenerate the non-WebGL globe from the same geographic map as the 3D sphere.
// Uses the project's installed Chrome/Playwright. No remote services are needed.
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
const source = await readFile(new URL("../public/textures/earth-daylight.jpg", import.meta.url));
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage();
  const png = await page.evaluate(
    async (data) => {
      const image = new Image();
      image.src = data;
      await image.decode();
      const map = document.createElement("canvas");
      map.width = image.naturalWidth;
      map.height = image.naturalHeight;
      const context = map.getContext("2d");
      context.drawImage(image, 0, 0);
      const original = context.getImageData(0, 0, map.width, map.height).data;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1024;
      const output = canvas.getContext("2d");
      const pixels = output.createImageData(1024, 1024);
      const tilt = (-20 * Math.PI) / 180;
      for (let py = 0; py < 1024; py++)
        for (let px = 0; px < 1024; px++) {
          const x = (px - 511.5) / 480,
            y = (511.5 - py) / 480;
          const distance = x * x + y * y;
          if (distance >= 1) continue;
          const z = Math.sqrt(1 - distance);
          const latitude = Math.asin(y * Math.cos(tilt) + z * Math.sin(tilt));
          const longitude =
            (78 * Math.PI) / 180 + Math.atan2(x, -y * Math.sin(tilt) + z * Math.cos(tilt));
          const u = (((longitude / (2 * Math.PI) + 0.5) % 1) + 1) % 1;
          const v = 0.5 - latitude / Math.PI;
          const index =
            (Math.floor(v * (map.height - 1)) * map.width + Math.floor(u * (map.width - 1))) * 4;
          const target = (py * 1024 + px) * 4;
          const shade = 0.86 + 0.14 * z;
          for (let channel = 0; channel < 3; channel++)
            pixels.data[target + channel] = original[index + channel] * shade;
          pixels.data[target + 3] = Math.min(255, (1 - distance) * 12000);
        }
      output.putImageData(pixels, 0, 0);
      return canvas.toDataURL("image/png").split(",")[1];
    },
    "data:image/jpeg;base64," + source.toString("base64"),
  );
  await writeFile(
    new URL("../public/textures/earth-india-fallback.png", import.meta.url),
    Buffer.from(png, "base64"),
  );
} finally {
  await browser.close();
}
