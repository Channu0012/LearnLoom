import { test, expect } from "@playwright/test";

// ── Basic smoke tests — run against local dev server ──────────────────────

test.describe("Home page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VeySkill/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder(/Paste any YouTube playlist/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Convert to Course/i })).toBeVisible();
  });

  test("Trending starter chip navigates to /explore with query", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Next\.js 15 Full-Stack/i }).click();
    await expect(page).toHaveURL(/\/explore\?q=/);
  });
});

test.describe("Explore page", () => {
  test("loads with search bar and refresh feed button", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByRole("searchbox", { name: /search courses/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /refresh feed/i })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("header shows VeySkill logo", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("link", { name: /VeySkill home/i })
    ).toBeVisible();
  });

  test("footer shows legal links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Terms of Service", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Refund & Cancellation/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Contact & Grievance/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Takedown Request/i })).toBeVisible();
  });
});

test.describe("Legal pages", () => {
  test("Terms of Service page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Terms of Service/i, level: 1 })).toBeVisible();
  });

  test("Privacy Policy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Privacy Policy/i, level: 1 })).toBeVisible();
  });

  test("Refund & Cancellation Policy page loads", async ({ page }) => {
    await page.goto("/refund");
    await expect(
      page.getByRole("heading", { name: /Refund & Cancellation Policy/i, level: 1 })
    ).toBeVisible();
  });

  test("Contact & Grievance page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /Contact VeySkill Support/i, level: 1 })
    ).toBeVisible();
  });

  test("Takedown Request page loads", async ({ page }) => {
    await page.goto("/takedown");
    await expect(page.getByRole("heading", { name: /Takedown/i, level: 1 })).toBeVisible();
  });
});

test.describe("Credential Verification", () => {
  test("Verification Portal loads with input and auto-detection", async ({ page }) => {
    await page.goto("/verify");
    await expect(
      page.getByRole("heading", { name: /Verify VeySkill Credential/i, level: 1 })
    ).toBeVisible();
    await expect(page.locator("#credential-input")).toBeVisible();
  });

  test("Verifies authentic benchmark credential VS-9A3F1B8E2C", async ({ page }) => {
    await page.goto("/verify/VS-9A3F1B8E2C");
    await expect(
      page.getByRole("heading", { name: /Official Credential Verification/i, level: 1 })
    ).toBeVisible();
    await expect(page.getByText("Distinguished Scholar").first()).toBeVisible();
    await expect(page.getByText(/Cryptographically Verified/i).first()).toBeVisible();
  });

  test("Strictly rejects counterfeit credentials", async ({ page }) => {
    await page.goto("/verify/VS-FAKECERT99");
    await expect(
      page.getByRole("heading", { name: /Certificate Verification Failed/i, level: 1 })
    ).toBeVisible();
    await expect(page.getByText(/Invalid or Forged Identifier/i)).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("shows 404 for unknown routes", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.getByText("This page doesn't exist")).toBeVisible();
  });
});

test.describe("Accessibility basics", () => {
  test("home page has no broken heading hierarchy", async ({ page }) => {
    await page.goto("/");
    // h1 must exist
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
  });

  test("all interactive elements on home page have accessible labels", async ({ page }) => {
    await page.goto("/");
    // All buttons should have text or aria-label
    const buttons = page.getByRole("button");
    for (const btn of await buttons.all()) {
      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute("aria-label");
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });
});
