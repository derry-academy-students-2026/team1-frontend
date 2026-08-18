import { expect, test } from "../fixtures/authenticated-test";
import {
	formatClosingDate,
	openJobRoles,
	secondaryOpenJobRole,
} from "../fixtures/test-data";
import { HomePage } from "../pages/home-page";
import { JobRoleDetailPage } from "../pages/job-role-detail-page";
import { JobRolesListPage } from "../pages/job-roles-list-page";

test.describe("Job roles list", () => {
	test("lists every seeded job role with its key details", async ({ page }) => {
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
		await listPage.openRole(secondaryOpenJobRole.roleName);

		await expect(new JobRoleDetailPage(page).heading).toHaveText(
			secondaryOpenJobRole.roleName,
		);
	});

	test("returns home through the list page header", async ({ page }) => {
		const listPage = new JobRolesListPage(page);
		await listPage.openHomeFromHeader();

		await expect(new HomePage(page).heading).toBeVisible();
	});
});
