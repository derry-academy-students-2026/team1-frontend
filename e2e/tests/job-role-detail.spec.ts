import { expect, test } from "@playwright/test";
import {
	formatClosingDate,
	seededJobRoles,
	testUser,
} from "../fixtures/test-data";
import { JobRoleDetailPage } from "../pages/job-role-detail-page";
import { JobRolesListPage } from "../pages/job-roles-list-page";
import { LoginPage } from "../pages/login-page";

test.describe("Job role detail", () => {
	test.beforeEach(async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(testUser.email, testUser.password);
	});

	test("shows full details for a valid job role", async ({ page }) => {
		const [role] = seededJobRoles;
		const listPage = new JobRolesListPage(page);
		await listPage.openRole(role.roleName);

		const detailPage = new JobRoleDetailPage(page);
		await expect(detailPage.heading).toHaveText(role.roleName);
		await expect(page.getByText(role.description)).toBeVisible();
		await expect(page.getByText(role.responsibilities)).toBeVisible();
		await expect(detailPage.facts).toContainText(role.location);
		await expect(detailPage.facts).toContainText(role.capability);
		await expect(detailPage.facts).toContainText(role.band);
		await expect(detailPage.facts).toContainText(
			formatClosingDate(role.closingDate),
		);
		await expect(detailPage.facts).toContainText(role.status, {
			ignoreCase: true,
		});
		await expect(detailPage.facts).toContainText(
			String(role.numberOfOpenPositions),
		);
	});

	test("returns to the job roles list via the back link", async ({ page }) => {
		const [role] = seededJobRoles;
		const listPage = new JobRolesListPage(page);
		await listPage.openRole(role.roleName);

		const detailPage = new JobRoleDetailPage(page);
		await detailPage.backLink.click();
		await expect(page).toHaveURL(/\/job-roles$/);
	});

	test("returns a 404 for a job role id that does not exist", async ({
		page,
	}) => {
		const response = await page.goto("/job-roles/999999");
		expect(response?.status()).toBe(404);
	});

	test("returns a 404 for a non-numeric job role id", async ({ page }) => {
		const response = await page.goto("/job-roles/not-a-number");
		expect(response?.status()).toBe(404);
	});
});
