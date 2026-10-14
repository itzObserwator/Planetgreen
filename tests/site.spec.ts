import { expect, test, type Page } from "@playwright/test";

async function openHome(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".site-preloader")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sustainable development.");
}

async function openEnquiry(page: Page) {
  if (page.viewportSize()!.width < 980) {
    await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await page
      .getByRole("navigation", { name: "More navigation" })
      .getByRole("button", { name: "Visit us" })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "Visit us" })
      .click();
  }
  return page.getByRole("dialog", { name: /closer to nature/ });
}

test("page has no horizontal overflow across its main sections", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openHome(page);
  for (const selector of ["#home", "#philosophy", "#communities", "#our-story", "#contact"]) {
    const section = page.locator(selector);
    await section.evaluate((element) =>
      element.scrollIntoView({ behavior: "instant", block: "start" }),
    );
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
      .toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
});

test("navigation reaches communities and the mobile menu closes with Escape", async ({ page }) => {
  await openHome(page);
  if (page.viewportSize()!.width < 980) {
    const open = page.getByRole("button", { name: "Open navigation", exact: true });
    await open.click();
    await expect(page.getByRole("navigation", { name: "More navigation" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Close navigation", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "More navigation" })).toBeHidden();
    await expect(open).toHaveAttribute("aria-expanded", "false");
    await open.click();
    await page
      .getByRole("navigation", { name: "More navigation" })
      .getByRole("link", { name: "Communities", exact: true })
      .click();
    await expect(page.getByRole("navigation", { name: "More navigation" })).toBeHidden();
  } else {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Communities", exact: true })
      .click();
  }
  await expect(page).toHaveURL(/\/communities\/$/);
  await expect(
    page.getByRole("heading", { name: /Creating communities for nature to live on/i }),
  ).toBeInViewport();
});

test("mobile navigation keeps keyboard focus within the menu and returns it on close", async ({
  page,
}) => {
  test.skip(page.viewportSize()!.width >= 980, "The mobile menu is shown below 980px.");
  await openHome(page);
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  const menu = page.getByRole("navigation", { name: "More navigation" });
  const close = page.getByRole("button", { name: "Close navigation", exact: true });
  const first = menu.getByRole("link", { name: /Our philosophy/ });
  const controls = menu.getByRole("link").or(menu.getByRole("button")).or(close);
  await expect(first).toBeFocused();
  for (let step = 0; step < (await controls.count()); step++) {
    await page.keyboard.press("Tab");
    await expect
      .poll(() =>
        controls.evaluateAll((elements) =>
          elements.some((element) => element === document.activeElement),
        ),
      )
      .toBe(true);
  }
  await expect(first).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(menu.getByRole("button", { name: "Visit us" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(page.getByRole("button", { name: "Open navigation", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.closest("main") !== null))
    .toBe(true);
});

test("each community expands, closes, and opens an enquiry for the selected venture", async ({
  page,
}) => {
  await openHome(page);
  for (const venture of ["Dates County", "Farm Natura", "Green Land Capital", "Veda Bharath"]) {
    const row = page
      .locator("#communities")
      .getByRole("button", { name: new RegExp(venture) })
      .filter({ hasNot: page.locator(".action-label") });
    await row.click();
    await expect(row).toHaveAttribute("aria-expanded", "true");
    const explore = page.getByRole("button", { name: `Explore ${venture}` });
    await expect(explore).toBeVisible();
    await row.click();
    await expect(row).toHaveAttribute("aria-expanded", "false");
    await expect(explore).toBeHidden();
    await row.click();
    await explore.click();
    const details = page.getByRole("dialog", { name: venture, exact: true });
    await expect(details).toBeVisible();
    await expect(
      details.getByRole("link", { name: `Visit the ${venture} website ↗` }),
    ).toHaveAttribute("href", /^https:\/\//);
    await details.getByRole("button", { name: "Get in touch" }).click();
    const enquiry = page.getByRole("dialog", { name: /closer to nature/ });
    await expect(enquiry).toBeVisible();
    await expect(enquiry.getByLabel("I’m interested in")).toHaveValue(venture);
    await page.keyboard.press("Escape");
    await expect(enquiry).toBeHidden();
  }
});

test("enquiry validates required fields and prepares a correctly encoded email draft", async ({
  page,
}) => {
  await openHome(page);
  const dialog = await openEnquiry(page);
  await expect(dialog).toBeVisible();
  const submit = dialog.getByRole("button", { name: "Prepare enquiry" });
  await submit.click();
  await expect(dialog.getByRole("link", { name: "Open email draft" })).toBeHidden();
  await expect(dialog.getByLabel("Your name")).toBeFocused();
  await dialog.getByLabel("Your name").fill("Asha & Ravi Kumar");
  await dialog.getByLabel("Email address").fill("invalid-email");
  await submit.click();
  await expect(dialog.getByLabel("Email address")).toBeFocused();
  await expect(dialog.getByRole("link", { name: "Open email draft" })).toBeHidden();
  await dialog.getByLabel("Email address").fill("asha+visit@example.com");
  await dialog.getByLabel(/Phone number/).fill("+91 98765 43210");
  await dialog.getByLabel("I’m interested in").selectOption("Veda Bharath");
  await dialog.getByLabel(/Preferred visit date/).fill("2030-01-05");
  await dialog
    .getByLabel(/Anything you’d like us to know/)
    .fill("We'd like to visit & learn about farming.");
  await submit.click();
  await expect(dialog.getByRole("heading", { name: "Your enquiry is ready." })).toBeVisible();
  const draft = new URL(
    (await dialog.getByRole("link", { name: "Open email draft" }).getAttribute("href"))!,
  );
  expect(draft.protocol).toBe("mailto:");
  expect(draft.pathname).toBe("marketing@planetgreen.co.in");
  expect(draft.searchParams.get("subject")).toContain("Veda Bharath");
  const body = draft.searchParams.get("body")!;
  for (const value of [
    "Asha & Ravi Kumar",
    "asha+visit@example.com",
    "+91 98765 43210",
    "2030-01-05",
    "visit & learn about farming.",
  ]) {
    expect(body).toContain(value);
  }
  await dialog.getByRole("button", { name: "Edit your enquiry" }).click();
  await expect(dialog.getByLabel("Your name")).toBeVisible();
  await dialog.getByRole("button", { name: "Close enquiry" }).click();
  await expect(dialog).toBeHidden();
});

test("photograph stack changes its image and counter using either control", async ({ page }) => {
  await openHome(page);
  const section = page.locator("#farm-natura");
  const counter = section.getByRole("button", { name: "View next farm photograph" });
  await expect(counter).toHaveText(/01\s*\/\s*04/);
  await counter.click();
  await expect(counter).toHaveText(/02\s*\/\s*04/);
  await expect(
    section.getByRole("img", { name: "Fresh gourds growing on the farm", exact: true }),
  ).toBeVisible();
  await section.getByRole("button", { name: /Next photograph:/ }).click();
  await expect(counter).toHaveText(/03\s*\/\s*04/);
  await expect(
    section.getByRole("img", { name: "A pavilion on the Farm Natura estate", exact: true }),
  ).toBeVisible();
});

test("gallery moves forward and back and stops at its boundaries", async ({ page }) => {
  await openHome(page);
  const previous = page.getByRole("button", { name: "Previous gallery photograph" });
  const next = page.getByRole("button", { name: "Next gallery photograph" });
  const first = page
    .locator("figure")
    .filter({ has: page.getByRole("heading", { name: "Farm Natura farmhouse" }) });
  await next.scrollIntoViewIfNeeded();
  await expect(previous).toBeDisabled();
  const initialLeft = (await first.boundingBox())!.x;
  await next.click();
  await expect(previous).toBeEnabled();
  await expect.poll(async () => (await first.boundingBox())!.x).toBeLessThan(0);
  await previous.click();
  await expect(previous).toBeDisabled();
  await expect
    .poll(async () => Math.abs((await first.boundingBox())!.x - initialLeft))
    .toBeLessThan(2);
  for (let step = 0; step < 5; step++) {
    if (await next.isDisabled()) break;
    await next.click();
    await page.waitForTimeout(700);
  }
  await expect(next).toBeDisabled();
  const endScroll = await first.evaluate((element) => element.parentElement!.scrollLeft);
  await previous.click();
  await expect
    .poll(() => first.evaluate((element) => element.parentElement!.scrollLeft))
    .toBeLessThan(endScroll - 1);
  await expect(next).toBeEnabled();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("opening and section content remain visible and navigation is usable", async ({ page }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrated|hydration/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    await openHome(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect
      .poll(() =>
        page.getByRole("heading", { level: 1 }).evaluate((element) => {
          let node: HTMLElement | null = element as HTMLElement;
          let opacity = 1;
          while (node) {
            opacity *= Number(getComputedStyle(node).opacity);
            node = node.parentElement;
          }
          return opacity;
        }),
      )
      .toBeGreaterThan(0.99);
    await page
      .locator("#philosophy")
      .evaluate((element) => element.scrollIntoView({ behavior: "instant", block: "start" }));
    await expect(page.getByRole("heading", { name: /Nature and people/ })).toBeInViewport();
    await expect
      .poll(() =>
        page
          .locator("#philosophy")
          .getByRole("heading", { name: /Nature and people/ })
          .evaluate((element) => {
            let node: HTMLElement | null = element as HTMLElement;
            let opacity = 1;
            while (node) {
              opacity *= Number(getComputedStyle(node).opacity);
              node = node.parentElement;
            }
            return opacity;
          }),
      )
      .toBeGreaterThan(0.99);
    const dialog = await openEnquiry(page);
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close enquiry" }).click();
    await expect(dialog).toBeHidden();
    expect(hydrationErrors).toEqual([]);
  });
});
