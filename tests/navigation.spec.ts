import { expect, test } from "@playwright/test";
test.use({ reducedMotion: "reduce" });
test("navbar links use the sourced pages and projects reach the correct community", async ({
  page,
}) => {
  await page.goto("/about-us/");
  if (page.viewportSize()!.width >= 980) {
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link", { name: "Our philosophy" })).toHaveAttribute(
      "href",
      "/philosophy/",
    );
    await expect(nav.getByRole("link", { name: "Communities", exact: true })).toHaveAttribute(
      "href",
      "/communities/",
    );
    await page.locator(".project-dropdown summary").click();
    for (const [name, id] of [
      ["Dates County", "dates-county"],
      ["Farm Natura", "farm-natura"],
      ["Green Land Capital", "green-land-capital"],
      ["Veda Bharath", "veda-bharath"],
    ])
      await expect(
        page.locator(".project-dropdown").getByRole("link", { name, exact: true }),
      ).toHaveAttribute("href", `/communities/#${id}`);
    await page.keyboard.press("Escape");
    await expect(page.locator(".project-dropdown")).not.toHaveAttribute("open", "");
    await nav.getByRole("link", { name: "Our philosophy" }).click();
  } else {
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await page
      .getByRole("navigation", { name: "More navigation" })
      .getByRole("link", { name: "Our philosophy" })
      .click();
  }
  await expect(page).toHaveURL(/\/philosophy\/$/);
  await expect(page.locator("main")).toContainText("That's where Planet Green steps in");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  if (page.viewportSize()!.width < 980) {
    await page
      .getByRole("navigation", { name: "More navigation" })
      .getByRole("link", { name: "Farm Natura", exact: true })
      .click();
  } else {
    await page.keyboard.press("Escape");
    await page.locator(".project-dropdown summary").click();
    await page
      .locator(".project-dropdown")
      .getByRole("link", { name: "Farm Natura", exact: true })
      .click();
  }
  await expect(page).toHaveURL(/\/communities\/#farm-natura$/);
  await expect(page.locator("#farm-natura")).toBeInViewport();
});

test("hamburger contains secondary pages, traps focus and closes with Escape", async ({ page }) => {
  await page.goto("/about-us/");
  const toggle = page.getByRole("button", { name: "Open navigation", exact: true });
  await toggle.click();
  const menu = page.getByRole("navigation", { name: "More navigation" });
  await expect(menu).toBeVisible();
  for (const name of [
    "About us",
    "Collaborations",
    "Gallery",
    "Careers",
    "Contact us",
    "Singapore · 2023",
    "Bahrain · 2023",
    "Privacy policy",
    "Terms & conditions",
  ])
    await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(page.getByRole("main")).toHaveAttribute("inert", "");
  const close = page.getByRole("button", { name: "Close navigation", exact: true });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(menu.getByRole("button", { name: "Visit us" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(page.getByRole("main")).not.toHaveAttribute("inert", "");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
    .toBeLessThanOrEqual(1);
});
