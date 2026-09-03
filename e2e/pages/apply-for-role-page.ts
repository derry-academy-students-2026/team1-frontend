import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page.js";

/**
 * Page object for the /job-roles/:id/apply page.
 */
export class ApplyForRolePage extends BasePage {
	readonly heading: Locator;
	readonly applicantNameInput: Locator;
	readonly applicantEmailInput: Locator;
	readonly submitButton: Locator;
	readonly errorMessage: Locator;
	readonly backLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { level: 1 });
		this.applicantNameInput = page.getByLabel("Full name");
		this.applicantEmailInput = page.getByLabel("Email address");
		this.submitButton = page.getByTestId("apply-submit");
		this.errorMessage = page.getByRole("alert");
		this.backLink = page.getByRole("link", { name: /^Back to / });
	}

	async goto(id: number) {
		await this.page.goto(`/job-roles/${id}/apply`);
	}

	async submitApplication(applicantName: string, applicantEmail: string) {
		await this.applicantNameInput.fill(applicantName);
		await this.applicantEmailInput.fill(applicantEmail);
		await this.submitButton.click();
	}
}
