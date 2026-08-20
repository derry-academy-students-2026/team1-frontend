import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page.js";

export class RegisterPage extends BasePage {
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly confirmPasswordInput: Locator;
	readonly submitButton: Locator;
	readonly errorMessage: Locator;

	constructor(page: Page) {
		super(page);
		this.emailInput = page.getByLabel("Email address");
		this.passwordInput = page.getByLabel("Password", { exact: true });
		this.confirmPasswordInput = page.getByLabel("Confirm password");
		this.submitButton = page.getByRole("button", { name: "Create account" });
		this.errorMessage = page.getByRole("alert");
	}

	async goto() {
		await this.page.goto("/register");
	}

	async enterEmail(email: string) {
		await this.emailInput.fill(email);
	}

	async enterPassword(password: string) {
		await this.passwordInput.fill(password);
	}

	async enterConfirmationPassword(password: string) {
		await this.confirmPasswordInput.fill(password);
	}

	async clickSubmit() {
		await this.submitButton.click();
	}
}
