import { expect, test } from "@playwright/test";
import { existsSync } from "node:fs";
import { pageDirectory } from "../src/data/page-directory";
import live from "../src/data/live-pages.json";

test.use({ reducedMotion: "reduce" });
test("all editorial routes preserve published copy and fit the viewport", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const entry of pageDirectory) {
    const response = await page.goto(`/${entry.slug}/`);
    expect(response?.status(), entry.slug).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${entry.title}.`);
    const main = page.locator("main");
    for (const section of live[entry.sourceKey].sections) {
      for (const block of section.blocks.filter((block) => block.tag === "p")) {
        await expect(main).toContainText(block.text);
      }
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
      .toBeLessThanOrEqual(1);
    expect(await page.locator(".earth-webgl").count()).toBe(0);
  }
  expect(errors).toEqual([]);
});

test("gallery filters, keyboard controls and photo viewer work", async ({ page }) => {
  await page.goto("/gallery/");
  const tabs = page.getByRole("tab");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".page-photo")).toHaveCount(12);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "View Farm Natura photo 1", exact: true }).click();
  const viewer = page.getByRole("dialog", { name: "Farm Natura photo viewer" });
  await expect(viewer).toBeVisible();
  await page.getByRole("button", { name: "Next photo" }).click();
  await expect(viewer).toContainText("2 / 12");
  await page.keyboard.press("ArrowLeft");
  await expect(viewer).toContainText("1 / 12");
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(
    page.getByRole("button", { name: "View Farm Natura photo 1", exact: true }),
  ).toBeFocused();
  await tabs.nth(2).click();
  await expect(page.locator(".page-photo")).toHaveCount(10);
});

test("collaborations load the original videos only on play", async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await page.goto("/collaborations/");
  await expect(page.locator(".video-frame")).toHaveCount(8);
  await expect(page.locator(".video-frame iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Play Diya Mirza on Sustainable Living" }).click();
  await expect(page.locator(".video-frame iframe")).toHaveAttribute("src", /qDiovuw6kxc/);
});

test("contact prepares an email and careers use the published HR details", async ({ page }) => {
  await page.goto("/contact-us/");
  const form = page.locator(".page-enquiry");
  await form.getByLabel("Your Name").fill("Asha");
  await form.getByLabel("Email Address").fill("asha@example.com");
  await form.getByLabel("Phone", { exact: true }).fill("9876543210");
  await form.getByLabel("Subject").fill("Site visit");
  await form.getByLabel("Write a Comment").fill("Please share visiting times.");
  await form.getByRole("button", { name: "Prepare message" }).click();
  const href = await form.getByRole("link", { name: "Open email draft" }).getAttribute("href");
  expect(decodeURIComponent(href!)).toContain(
    "mailto:marketing@planetgreen.co.in?subject=Site visit",
  );
  expect(decodeURIComponent(href!)).toContain("Please share visiting times.");
  await page.goto("/careers/");
  await expect(page.locator('main a[href="mailto:hr@planetgreen.co.in"]')).toBeVisible();
  await expect(page.locator('main a[href="tel:+919100666124"]')).toBeVisible();
});

test("navigation and footer expose every new page, and all imported images exist", async ({
  page,
}) => {
  await page.goto("/about-us/");
  for (const entry of pageDirectory)
    await expect(
      page.locator(".footer-page-links a").filter({ hasText: entry.label }),
    ).toHaveAttribute("href", `/${entry.slug}/`);
  for (const value of Object.values(live)) {
    if (typeof value === "object" && !Array.isArray(value) && "sections" in value) {
      for (const section of value.sections)
        for (const src of section.images) expect(existsSync("public" + src), src).toBe(true);
    }
  }
});
