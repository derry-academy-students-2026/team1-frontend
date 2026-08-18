import { expect, test } from "@playwright/test";
import { urls } from "../fixtures/test-data";
import { HomePage } from "../pages/home-page.js";

test.describe("Public navigation", () => {
	test("home page shows a sign in link when logged out", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();

		await expect(homePage.heading).toBeVisible();
		await expect(homePage.headerSignInLink).toBeVisible();
		await expect(homePage.headerSignOutLink).toHaveCount(0);
	});

	test("every home page job roles link requires sign in", async ({ page }) => {
		const homePage = new HomePage(page);
		const openJobRoles = [
			() => homePage.openJobRoles(),
			() => homePage.openJobRolesFromHero(),
			() => homePage.viewAllJobRoles(),
			() => homePage.viewOpenRoles(),
			() => homePage.openJobRolesFromFooter(),
		];

		for (const openRoles of openJobRoles) {
			await homePage.goto();
			await openRoles();

			await expect(page).toHaveURL(/\/login$/);
		}
	});

	test("hero sign in link opens the login page", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();
		await homePage.signInFromHero();

		await expect(page).toHaveURL(urls.login);
	});
});
