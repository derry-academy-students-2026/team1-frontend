import type { Locator, Page } from "@playwright/test";

/**
 * Page object for the /job-roles list page.
 */
export class JobRolesListPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly rows: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole("heading", { name: "Job roles", level: 1 });
		this.rows = page.locator("table tbody tr");
	}

	async goto() {
		await this.page.goto("/job-roles");
	}

	roleLink(roleName: string): Locator {
		return this.page.getByRole("link", { name: roleName });
	}

	rowForRole(roleName: string): Locator {
		return this.rows.filter({ has: this.roleLink(roleName) });
	}

	async openRole(roleName: string) {
		await this.roleLink(roleName).click();
	}
}
