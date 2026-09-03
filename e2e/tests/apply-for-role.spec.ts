import { expect, test } from "../fixtures/authenticated-test";
import {
	primaryClosedJobRole,
	primaryOpenJobRole,
} from "../fixtures/test-data";
import { ApplyForRolePage } from "../pages/apply-for-role-page";
import { JobRoleDetailPage } from "../pages/job-role-detail-page";

test.describe("Apply for role", () => {
	// AC1 (happy path): button shown when open positions > 0 and status is "open".
	test("@smoke shows the Apply button for an open role with available positions", async ({
		page,
	}) => {
		const detailPage = new JobRoleDetailPage(page);
		await detailPage.goto(primaryOpenJobRole.id);

		await expect(detailPage.applyButton).toBeVisible();
	});

	// AC1 (negative path): button hidden for any role that isn't open, regardless of positions.
	test("@regression hides the Apply button for a closed role", async ({
		page,
	}) => {
		const detailPage = new JobRoleDetailPage(page);
		await detailPage.goto(primaryClosedJobRole.id);

		await expect(detailPage.applyButton).toBeHidden();
	});

	// AC2: clicking Apply navigates to a dedicated page to enter applicant details.
	test("@smoke navigates to the apply page when the Apply button is clicked", async ({
		page,
	}) => {
		const detailPage = new JobRoleDetailPage(page);
		await detailPage.goto(primaryOpenJobRole.id);

		await detailPage.clickApply();

		await expect(page).toHaveURL(`/job-roles/${primaryOpenJobRole.id}/apply`);
		const applyPage = new ApplyForRolePage(page);
		await expect(applyPage.applicantNameInput).toBeVisible();
		await expect(applyPage.applicantEmailInput).toBeVisible();
	});

	// AC2 (validation path): invalid input is rejected and the form re-shows the error with input preserved.
	test("@regression shows a validation error and preserves input for an invalid email", async ({
		page,
	}) => {
		const applyPage = new ApplyForRolePage(page);
		await applyPage.goto(primaryOpenJobRole.id);

		await test.step("submit the form with an invalid email", async () => {
			await applyPage.submitApplication("Jane Doe", "not-an-email");
		});

		await expect(page).toHaveURL(/applyError=/);
		await expect(applyPage.errorMessage).toBeVisible();
		await expect(applyPage.applicantNameInput).toHaveValue("Jane Doe");
	});

	// AC2/AC3 (happy path): submitting a valid application persists it and sets status to "in progress".
	// Blocked until the backend implements POST /job-roles/:id/apply (US050 backend counterpart);
	// the frontend currently redirects with a generic error because that route does not exist yet.
	test.fixme("@smoke submits a valid application and shows a success confirmation", async ({
		page,
	}) => {
		const applyPage = new ApplyForRolePage(page);
		await applyPage.goto(primaryOpenJobRole.id);

		await applyPage.submitApplication("Jane Doe", "jane.doe@example.com");

		await expect(page).toHaveURL(/applySuccess=1/);
		const detailPage = new JobRoleDetailPage(page);
		await expect(detailPage.applySuccessMessage).toBeVisible();
	});
});
