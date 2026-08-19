import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page.js";

/**
 * Page object for the /job-roles list page.
 */
export class JobRolesListPage extends BasePage {
	readonly heading: Locator;
	readonly rows: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Job roles", level: 1 });
		this.rows = page.locator("table tbody tr");
	}

	async goto() {
		await this.page.goto("/job-roles");
	}

	checkRoleLink(roleName: string): Locator {
		return this.page.getByRole("link", { name: roleName });
	}

	checkRowForRole(roleName: string): Locator {
		return this.rows.filter({ has: this.checkRoleLink(roleName) });
	}

	async clickOpenRole(roleName: string) {
		await this.checkRoleLink(roleName).click();
	}

	async signOut() {
		await this.signOutFromHeader();
	}
}
