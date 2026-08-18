import { expect, test } from "@playwright/test";
import { testUser } from "../fixtures/test-data";
import { JobRolesListPage } from "../pages/job-roles-list-page";
import { LoginPage } from "../pages/login-page";

test.describe("Authentication", () => {
	test("redirects unauthenticated users away from the job roles list", async ({
		page,
	}) => {
		await page.goto("/job-roles");
		await expect(page).toHaveURL(/\/login$/);
	});

	test("shows an error when the login form is submitted empty", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.submitButton.click();

		await expect(loginPage.errorMessage).toHaveText(
			"Enter your email and password",
		);
	});

	test("shows an error for invalid credentials", async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login("wrong@kainos.com", "wrong-password");

		await expect(loginPage.errorMessage).toHaveText(
			"Invalid email or password",
		);
	});

	test("logs in successfully and reaches the job roles list", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(testUser.email, testUser.password);

		await expect(page).toHaveURL(/\/job-roles$/);
		await expect(new JobRolesListPage(page).heading).toBeVisible();
	});

	test("redirects an already-authenticated user away from the login page", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(testUser.email, testUser.password);

		await loginPage.goto();
		await expect(page).toHaveURL(/\/job-roles$/);
	});

	test("logs out and blocks further access to protected pages", async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(testUser.email, testUser.password);

		await page.getByRole("link", { name: "Sign out" }).click();
		await expect(page).toHaveURL(/\/login$/);

		await page.goto("/job-roles");
		await expect(page).toHaveURL(/\/login$/);
	});
});
