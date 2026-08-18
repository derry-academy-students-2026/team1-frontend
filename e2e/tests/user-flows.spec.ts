import { expect, test as unauthenticatedTest } from "@playwright/test";
import {
	expect as authenticatedExpect,
	test as authenticatedTest,
} from "../fixtures/authenticated-test";
import { primaryOpenJobRole, testUser, urls } from "../fixtures/test-data";
import { HomePage } from "../pages/home-page";
import { JobRoleDetailPage } from "../pages/job-role-detail-page";
import { JobRolesListPage } from "../pages/job-roles-list-page";
import { LoginPage } from "../pages/login-page";

authenticatedTest.describe("Authenticated User Flows", () => {
	authenticatedTest("navigates from home to job roles", async ({ page }) => {
		const homePage = new HomePage(page);
		await homePage.goto();
		await homePage.openJobRoles();

		await authenticatedExpect(page).toHaveURL(urls.jobRoles);
		await authenticatedExpect(new JobRolesListPage(page).heading).toBeVisible();
	});

	authenticatedTest(
		"returns to the job roles list from a role detail page",
		async ({ page }) => {
			const listPage = new JobRolesListPage(page);
			await listPage.openRole(primaryOpenJobRole.roleName);
			await authenticatedExpect(page).toHaveURL(/\/job-roles\/\d+$/);

			const detailPage = new JobRoleDetailPage(page);
			await detailPage.returnToJobRoles();
			await authenticatedExpect(page).toHaveURL(urls.jobRoles);
		},
	);

	authenticatedTest(
		"returns to job roles from home through the footer",
		async ({ page }) => {
			const listPage = new JobRolesListPage(page);
			await listPage.openHomeFromHeader();
			await authenticatedExpect(new HomePage(page).heading).toBeVisible();

			await new HomePage(page).openJobRolesFromFooter();
			await authenticatedExpect(page).toHaveURL(urls.jobRoles);
		},
	);
});

unauthenticatedTest.describe("Not Authenticated User Flows", () => {
	unauthenticatedTest(
		"redirects from home to login when opening job roles",
		async ({ page }) => {
			const homePage = new HomePage(page);
			await homePage.goto();
			await homePage.openJobRoles();

			await expect(page).toHaveURL(urls.login);
		},
	);

	unauthenticatedTest(
		"redirects from a job role detail URL to login",
		async ({ page }) => {
			await page.goto("/job-roles/1");

			await expect(page).toHaveURL(urls.login);
		},
	);

	unauthenticatedTest(
		"redirects to login when navigating to job roles after signing out",
		async ({ page }) => {
			const loginPage = new LoginPage(page);
			await loginPage.goto();
			await loginPage.login(testUser.email, testUser.password);
			await expect(page).toHaveURL(urls.jobRoles);

			await new JobRolesListPage(page).signOut();
			await expect(page).toHaveURL(urls.login);

			await page.goto("/job-roles");
			await expect(page).toHaveURL(urls.login);
		},
	);

	unauthenticatedTest(
		"signs in from home, opens a job role, and signs out",
		async ({ page }) => {
			const homePage = new HomePage(page);
			await homePage.goto();
			await homePage.signInFromHero();
			await expect(page).toHaveURL(urls.login);

			const loginPage = new LoginPage(page);
			await loginPage.enterEmail(testUser.email);
			await loginPage.enterPassword(testUser.password);
			await loginPage.submit();
			await expect(page).toHaveURL(urls.jobRoles);

			const listPage = new JobRolesListPage(page);
			await listPage.openRole(primaryOpenJobRole.roleName);
			await expect(page).toHaveURL(/\/job-roles\/\d+$/);
			await expect(new JobRoleDetailPage(page).heading).toHaveText(
				primaryOpenJobRole.roleName,
			);

			await new JobRolesListPage(page).signOut();
			await expect(page).toHaveURL(urls.login);

			await page.goto("/job-roles");
			await expect(page).toHaveURL(urls.login);
		},
	);
});
