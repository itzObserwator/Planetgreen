import { expect, test } from "@playwright/test";

test("themed preloader releases a slow page and does not return on internal navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let releaseFont!: () => void;
  const fontHeld = new Promise<void>((resolve) => {
    releaseFont = resolve;
  });
  await page.route("**/plus-jakarta-sans-variable.woff2", async (route) => {
    await fontHeld;
    await route.continue();
  });
  await page.goto("/about-us/", { waitUntil: "domcontentloaded" });
  const loader = page.locator(".site-preloader");
  await expect(loader).toBeVisible();
  await expect(loader).toContainText("Move to Nature.");
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  // Even while the font is still held, first-paint waiting must be bounded.
  await expect(loader).toHaveCount(0, { timeout: 9000 });
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  releaseFont();
  if (page.viewportSize()!.width < 980) {
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await page
      .getByRole("navigation", { name: "More navigation" })
      .getByRole("link", { name: "Our philosophy" })
      .click();
  } else
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Our philosophy" })
      .click();
  await expect(page).toHaveURL(/\/philosophy\/$/);
  await expect(loader).toHaveCount(0);
  expect(errors).toEqual([]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("preloader does not cover the readable page", async ({ page }) => {
    await page.goto("/about-us/");
    await expect(page.locator(".site-preloader")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("globe and orbits remain still and the page becomes interactive", async ({ page }) => {
    let releaseFont!: () => void;
    await page.route("**/plus-jakarta-sans-variable.woff2", async (route) => {
      await new Promise<void>((resolve) => {
        releaseFont = resolve;
      });
      await route.continue();
    });
    await page.goto("/about-us/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".preloader-orbit").first()).toHaveCSS("animation-name", "none");
    await expect(page.locator(".preloader-planet > img")).toHaveCSS("animation-name", "none");
    releaseFont();
    await expect(page.locator(".site-preloader")).toHaveCount(0);
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "More navigation" })).toBeVisible();
  });
});

test("cached assets still leave enough time to see the preloader", async ({ page }) => {
  await page.addInitScript(() => {
    const timing = { appeared: 0, exiting: 0 };
    (window as unknown as { preloaderTiming: typeof timing }).preloaderTiming = timing;
    const observer = new MutationObserver(() => {
      const loader = document.querySelector<HTMLElement>(".site-preloader");
      if (loader && !timing.appeared) timing.appeared = performance.now();
      if (loader?.dataset.phase === "exiting") {
        timing.exiting = performance.now();
        observer.disconnect();
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-phase"],
    });
  });
  await page.goto("/about-us/", { waitUntil: "domcontentloaded" });
  const loader = page.locator(".site-preloader");
  await expect(loader).toHaveAttribute("data-phase", "loading");
  await expect(loader).toHaveCount(0, { timeout: 9000 });
  const duration = await page.evaluate(() => {
    const timing = (window as unknown as { preloaderTiming: { appeared: number; exiting: number } })
      .preloaderTiming;
    return timing.exiting - timing.appeared;
  });
  expect(duration).toBeGreaterThanOrEqual(5950);
});
