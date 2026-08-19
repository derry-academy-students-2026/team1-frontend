import { expect, test } from "@playwright/test";
import { testUser, urls } from "../fixtures/test-data";
import { JobRolesListPage } from "../pages/job-roles-list-page";
import { LoginPage } from "../pages/login-page";

test.describe("Authentication", () => {
	test("redirects unauthenticated users away from the job roles list", async ({
		page,
	}) => {
		await page.goto("/job-roles");
		await expect(page).toHaveURL(urls.login);
	});

	test("returns to the home page through the login header", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.clickOpenHomeFromHeader();

		await expect(page).toHaveURL(/\/$/);
	});

	test("shows an error when the login form is submitted empty", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.clickSubmit();

		await expect(loginPage.errorMessage).toHaveText(
			"Enter your email and password",
		);
	});

	test("shows an error for invalid credentials", async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.enterEmail("wrong@kainos.com");
		await loginPage.enterPassword("wrong-password");
		await loginPage.clickSubmit();

		await expect(loginPage.errorMessage).toHaveText(
			"Invalid email or password",
		);
	});

	test("logs in successfully and reaches the job roles list", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.enterEmail(testUser.email);
		await loginPage.enterPassword(testUser.password);
		await loginPage.clickSubmit();

		await expect(page).toHaveURL(urls.jobRoles);
		await expect(new JobRolesListPage(page).heading).toBeVisible();
	});

	test("redirects an already-authenticated user away from the login page", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.enterEmail(testUser.email);
		await loginPage.enterPassword(testUser.password);
		await loginPage.clickSubmit();

		await loginPage.goto();
		await expect(page).toHaveURL(urls.jobRoles);
	});

	test("logs out and blocks further access to protected pages", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.enterEmail(testUser.email);
		await loginPage.enterPassword(testUser.password);
		await loginPage.clickSubmit();

		await new JobRolesListPage(page).signOut();
		await expect(page).toHaveURL(urls.login);

		await page.goto("/job-roles");
		await expect(page).toHaveURL(urls.login);
	});
});
