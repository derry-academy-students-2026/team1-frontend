import { expect, test } from "@playwright/test";

test.describe("Public navigation", () => {
	test("home page shows a sign in link when logged out", async ({ page }) => {
		await page.goto("/");

		await expect(
			page.getByRole("heading", { name: "Make a difference with technology" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Sign in" }).first(),
		).toBeVisible();
		await expect(page.getByRole("link", { name: "Sign out" })).toHaveCount(0);
	});

	test("job roles link in the header requires sign in", async ({ page }) => {
		await page.goto("/");
		await page
			.getByRole("navigation", { name: "Main navigation" })
			.getByRole("link", { name: "Job roles" })
			.click();

		await expect(page).toHaveURL(/\/login$/);
	});
});
