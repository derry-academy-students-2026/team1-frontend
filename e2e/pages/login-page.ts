import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page.js";

/**
 * Page object for the /login page.
 */
export class LoginPage extends BasePage {
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;
	readonly errorMessage: Locator;

	constructor(page: Page) {
		super(page);
		this.emailInput = page.locator("#email");
		this.passwordInput = page.locator("#password");
		this.submitButton = page.getByRole("button", { name: "Sign in" });
		this.errorMessage = page.getByRole("alert");
	}

	async goto() {
		await this.page.goto("/login");
	}

	async enterEmail(email: string) {
		await this.emailInput.fill(email);
	}

	async enterPassword(password: string) {
		await this.passwordInput.fill(password);
	}

	async submit() {
		await this.submitButton.click();
	}

	async login(email: string, password: string) {
		await this.enterEmail(email);
		await this.enterPassword(password);
		await this.submit();
	}
}
