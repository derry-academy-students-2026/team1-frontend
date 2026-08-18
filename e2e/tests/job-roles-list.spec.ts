import { expect, test } from "@playwright/test";
import {
	formatClosingDate,
	seededJobRoles,
	testUser,
} from "../fixtures/test-data";
import { JobRoleDetailPage } from "../pages/job-role-detail-page";
import { JobRolesListPage } from "../pages/job-roles-list-page";
import { LoginPage } from "../pages/login-page";

test.describe("Job roles list", () => {
	test.beforeEach(async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(testUser.email, testUser.password);
	});

	test("lists every seeded job role with its key details", async ({ page }) => {
		// The backend only returns roles with an "open" status.
		const openJobRoles = seededJobRoles.filter(
			(role) => role.status === "open",
		);

		const listPage = new JobRolesListPage(page);
		await expect(listPage.rows).toHaveCount(openJobRoles.length);

		for (const role of openJobRoles) {
			const row = listPage.rowForRole(role.roleName);
			await expect(row).toContainText(role.location);
			await expect(row).toContainText(role.capability);
			await expect(row).toContainText(role.band);
			await expect(row).toContainText(formatClosingDate(role.closingDate));
			await expect(row).toContainText(role.status, { ignoreCase: true });
		}
	});

	test("navigates to a job role's detail page", async ({ page }) => {
		const listPage = new JobRolesListPage(page);
		const targetRole = seededJobRoles[1];
		await listPage.openRole(targetRole.roleName);

		await expect(new JobRoleDetailPage(page).heading).toHaveText(
			targetRole.roleName,
		);
	});
});
