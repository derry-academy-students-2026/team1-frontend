import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page.js";

export class ApplyForRolePage extends BasePage {
	readonly heading: Locator;
	readonly applicantNameInput: Locator;
	readonly applicantEmailInput: Locator;
	readonly phoneNumberInput: Locator;
	readonly addressInput: Locator;
	readonly rightToWorkYes: Locator;
	readonly privacyConsent: Locator;
	readonly privacyPolicyLink: Locator;
	readonly submitButton: Locator;
	readonly emailErrorMessage: Locator;
	readonly backLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { level: 1 });
		this.applicantNameInput = page.getByLabel("Full name");
		this.applicantEmailInput = page.getByLabel("Email address");
		this.phoneNumberInput = page.getByLabel("Phone number");
		this.addressInput = page.getByLabel("Home address");
		this.rightToWorkYes = page.getByLabel("Yes", { exact: true });
		this.privacyConsent = page.getByLabel(/I consent to Kainos storing/);
		this.privacyPolicyLink = page.getByRole("link", { name: "Privacy Policy" });
		this.emailErrorMessage = page.locator("#applicantEmail-error");
		this.submitButton = page.getByTestId("apply-submit");
		this.backLink = page.getByRole("link", { name: /^Back to / });
	}

	async goto(id: number) {
		await this.page.goto(`/job-roles/${id}/apply`);
	}

	async submitApplication(applicantName: string, applicantEmail: string) {
		await this.applicantNameInput.fill(applicantName);
		await this.applicantEmailInput.fill(applicantEmail);
		await this.phoneNumberInput.fill("07123456789");
		await this.addressInput.fill("1 Test Street, Derry");
		await this.rightToWorkYes.check();
		await this.privacyConsent.check();
		await this.submitButton.click();
	}
}
