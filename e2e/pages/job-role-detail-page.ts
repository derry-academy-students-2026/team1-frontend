import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page.js";

/**
 * Page object for the /job-roles/:id detail page.
 */
export class JobRoleDetailPage extends BasePage {
	readonly heading: Locator;
	readonly description: Locator;
	readonly responsibilities: Locator;
	readonly facts: Locator;
	readonly backLink: Locator;
	readonly breadcrumbBackLink: Locator;
	readonly jobSpecificationLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { level: 1 });
		this.description = page
			.getByRole("heading", { name: "Description" })
			.locator("+ p");
		this.responsibilities = page
			.getByRole("heading", { name: "Responsibilities" })
			.locator("+ p");
		this.facts = page.locator(".job-role-detail__facts");
		this.backLink = page.getByRole("link", { name: "Back to job roles" });
		this.breadcrumbBackLink = page
			.getByRole("navigation", { name: "Breadcrumb" })
			.getByRole("link", { name: "Job roles" });
		this.jobSpecificationLink = page.getByRole("link", {
			name: "View job specification",
		});
	}

	async goto(id: number) {
		await this.page.goto(`/job-roles/${id}`);
	}

	async returnToJobRoles() {
		await this.backLink.click();
	}

	async returnToJobRolesViaBreadcrumb() {
		await this.breadcrumbBackLink.click();
	}

	async viewJobSpecification() {
		await this.jobSpecificationLink.click();
	}
}
