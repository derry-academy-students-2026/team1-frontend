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
			() => homePage.clickOpenJobRoles(),
			() => homePage.clickOpenJobRolesFromHero(),
			() => homePage.clickViewAllJobRoles(),
			() => homePage.clickViewOpenRoles(),
			() => homePage.clickOpenJobRolesFromFooter(),
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
		await homePage.clickSignInFromHero();

		await expect(page).toHaveURL(urls.login);
	});

	test("skip link moves to the main content", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();

		await homePage.skipToMainContent();
		await expect(page).toHaveURL(/\/#main-content$/);
	});

	test("header sign in link opens the login page", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();

		await homePage.clickOpenLoginFromHeader();
		await expect(page).toHaveURL(urls.login);
	});

	test("site logo opens the home page", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();

		await homePage.clickOpenHomeFromLogo();
		await expect(page).toHaveURL(/\/$/);
	});

	test("footer home link opens the home page", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();

		await homePage.clickOpenHomeFromFooter();
		await expect(page).toHaveURL(/\/$/);
	});

	test("footer contact links use email and telephone destinations", async ({
		page,
	}) => {
		const homePage = new HomePage(page);
		await homePage.goto();

		await expect(homePage.contactEmailLink).toHaveAttribute(
			"href",
			"mailto:careers@kainos.com",
		);
		await expect(homePage.contactPhoneLink).toHaveAttribute(
			"href",
			"tel:+442890367000",
		);
	});
});
