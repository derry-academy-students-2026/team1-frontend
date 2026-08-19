import { expect, test } from "../fixtures/authenticated-test";
import {
	formatClosingDate,
	primaryOpenJobRole,
	urls,
} from "../fixtures/test-data";
import { JobRoleDetailPage } from "../pages/job-role-detail-page";
import { JobRolesListPage } from "../pages/job-roles-list-page";

test.describe("Job role detail", () => {
	test("shows full details for a valid job role", async ({ page }) => {
		const listPage = new JobRolesListPage(page);
		await listPage.clickOpenRole(primaryOpenJobRole.roleName);

		const detailPage = new JobRoleDetailPage(page);
		await expect(detailPage.heading).toHaveText(primaryOpenJobRole.roleName);
		await expect(detailPage.description).toHaveText(
			primaryOpenJobRole.description,
		);
		await expect(detailPage.responsibilities).toHaveText(
			primaryOpenJobRole.responsibilities,
		);
		await expect(detailPage.facts).toContainText(primaryOpenJobRole.location);
		await expect(detailPage.facts).toContainText(primaryOpenJobRole.capability);
		await expect(detailPage.facts).toContainText(primaryOpenJobRole.band);
		await expect(detailPage.facts).toContainText(
			formatClosingDate(primaryOpenJobRole.closingDate),
		);
		await expect(detailPage.facts).toContainText(primaryOpenJobRole.status, {
			ignoreCase: true,
		});
		await expect(detailPage.facts).toContainText(
			String(primaryOpenJobRole.numberOfOpenPositions),
		);
	});

	test("returns to the job roles list via the back link", async ({ page }) => {
		const listPage = new JobRolesListPage(page);
		await listPage.clickOpenRole(primaryOpenJobRole.roleName);

		const detailPage = new JobRoleDetailPage(page);
		await detailPage.clickReturnToJobRoles();
		await expect(page).toHaveURL(urls.jobRoles);
	});

	test("returns to the job roles list via the breadcrumb", async ({ page }) => {
		const listPage = new JobRolesListPage(page);
		await listPage.clickOpenRole(primaryOpenJobRole.roleName);

		const detailPage = new JobRoleDetailPage(page);
		await detailPage.clickReturnToJobRolesViaBreadcrumb();

		await expect(page).toHaveURL(urls.jobRoles);
	});

	test("offers the job specification in a new tab", async ({ page }) => {
		const listPage = new JobRolesListPage(page);
		await listPage.clickOpenRole(primaryOpenJobRole.roleName);

		const detailPage = new JobRoleDetailPage(page);
		await expect(detailPage.jobSpecificationLink).toHaveAttribute(
			"target",
			"_blank",
		);
		await expect(detailPage.jobSpecificationLink).toHaveAttribute("href");
		const newTab = page.waitForEvent("popup");
		await detailPage.clickViewJobSpecification();
		await newTab;
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
