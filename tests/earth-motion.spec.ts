import { expect, test } from "@playwright/test";

test("globe grows and descends around the same center as the introduction replaces the title", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const earth = page.locator(".hero-earth");
  const canvas = earth.locator("canvas");
  await expect(canvas).toBeVisible();
  const initial = (await canvas.boundingBox())!;
  const viewport = page.viewportSize()!;
  const renderWidth = await canvas.evaluate((element) => element.clientWidth);
  await page.evaluate((height) => window.scrollTo(0, height * 0.5), viewport.height);
  await expect(page.getByRole("heading", { name: /We create communities/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeHidden();
  const expanded = (await canvas.boundingBox())!;
  expect(expanded.width).toBeGreaterThan(initial.width * 1.3);
  expect(expanded.y).toBeGreaterThan(initial.y);
  expect(Math.abs(expanded.x + expanded.width / 2 - (initial.x + initial.width / 2))).toBeLessThan(
    2,
  );
  await expect(earth).toHaveCSS("opacity", "1");
  for (const progress of [0.75, 1]) {
    await page.evaluate((value) => window.scrollTo(0, value), viewport.height * progress);
    await expect
      .poll(async () => (await canvas.boundingBox())!.width / initial.width)
      .toBeCloseTo(1 + progress, 2);
    const zoomed = (await canvas.boundingBox())!;
    expect(zoomed.y).toBeGreaterThan(expanded.y);
    expect(Math.abs(zoomed.x + zoomed.width / 2 - viewport.width / 2)).toBeLessThan(2);
    // Growing CSS bounds must not resize the renderer and cancel the visual zoom.
    expect(await canvas.evaluate((element) => element.clientWidth)).toBe(renderWidth);
  }
  await page.evaluate((height) => window.scrollTo(0, height * 1.6), viewport.height);
  await expect(earth).toHaveCSS("visibility", "hidden");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect
    .poll(async () => Math.abs((await canvas.boundingBox())!.width - initial.width))
    .toBeLessThan(2);
});

test("hero words reveal in sequence, copy enters after them, and reversing resets the reveal", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const openingWords = page.locator(".hero-opening .reveal-word-inner");
  await expect(openingWords.last()).toHaveCSS("opacity", "1");
  const height = page.viewportSize()!.height;
  await page.evaluate((value) => window.scrollTo(0, value), height * 0.19);
  await expect(page.getByRole("heading", { name: /We create communities/ })).toBeHidden();
  await page.evaluate((value) => window.scrollTo(0, value), height * 0.21);
  const words = page.locator(".hero-introduction .reveal-word-inner");
  await expect
    .poll(() =>
      words.evaluateAll((elements) => {
        const first = getComputedStyle(elements[0]);
        const last = getComputedStyle(elements[elements.length - 1]);
        return (
          Number(first.opacity) > Number(last.opacity) &&
          new DOMMatrix(first.transform).m42 < new DOMMatrix(last.transform).m42
        );
      }),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page
        .locator(".hero-introduction > p")
        .last()
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDelay)),
    )
    .toBe(0.2);
  await expect(words.last()).toHaveCSS("opacity", "1");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(words.last()).toHaveCSS("opacity", "0");
  await expect(words.last()).toHaveCSS("transition-duration", "0.3s, 0.3s");
  await expect(openingWords.last()).toHaveCSS("opacity", "1");
});

test("Earth backgrounds load behind the footer and keep their placement when a venture expands", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const landscape = page.locator(".earth-landscape-footer");
  const image = landscape.locator("img");
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0),
    )
    .toBe(true);
  const top = await landscape.evaluate((element) =>
    Number.parseFloat((element as HTMLElement).style.top),
  );
  const footerTop = await page
    .locator("footer")
    .evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  await page.locator("#communities .community-row-button").first().click();
  await expect
    .poll(() =>
      landscape.evaluate((element) => Number.parseFloat((element as HTMLElement).style.top)),
    )
    .toBeGreaterThan(top + 100);
  await expect
    .poll(() =>
      page.evaluate(
        ({ footerTop, top }) => {
          const footer = document.querySelector("footer")!;
          const landscape = document.querySelector<HTMLElement>(".earth-landscape-footer")!;
          const shiftedFooter = footer.getBoundingClientRect().top + window.scrollY;
          const shiftedLandscape = Number.parseFloat(landscape.style.top);
          return Math.abs(shiftedFooter - footerTop - (shiftedLandscape - top));
        },
        { footerTop, top },
      ),
    )
    .toBeLessThan(2);
  await page
    .locator("footer")
    .evaluate((element) =>
      window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 100),
    );
  const bounds = (await image.boundingBox())!;
  expect(bounds.height).toBeGreaterThan(200);
  expect(bounds.y).toBeLessThan(page.viewportSize()!.height);
  expect(bounds.y + bounds.height).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Let’s get in touch" }).click();
  await expect(page.getByRole("dialog", { name: /closer to nature/ })).toBeVisible();
});

test.describe("reduced-motion Earth", () => {
  test.use({ reducedMotion: "reduce" });
  test("globe leaves with the hero and does not cover later page content", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".hero-earth")).toHaveCSS("position", "absolute");
    await page.getByRole("heading", { name: /Different paths/ }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: /Different paths/ })).toBeInViewport();
    await expect(page.locator(".hero-earth")).not.toBeInViewport();
  });
});
