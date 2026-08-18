import type { Locator, Page } from "@playwright/test";

/**
 * Page object for the /job-roles/:id detail page.
 */
export class JobRoleDetailPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly facts: Locator;
	readonly backLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole("heading", { level: 1 });
		this.facts = page.locator(".job-role-detail__facts");
		this.backLink = page.getByRole("link", { name: "Back to job roles" });
	}

	async goto(id: number) {
		await this.page.goto(`/job-roles/${id}`);
	}
}
