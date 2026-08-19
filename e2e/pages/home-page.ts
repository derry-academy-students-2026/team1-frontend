import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page.js";

/**
 * Page object for the / page.
 */
export class HomePage extends BasePage {
	readonly heading: Locator;
	readonly heroJobRolesLink: Locator;
	readonly heroSignInLink: Locator;
	readonly viewAllRolesLink: Locator;
	readonly openRolesLink: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", {
			name: "Make a difference with technology",
		});
		this.heroJobRolesLink = page.getByRole("link", {
			name: "Explore job roles",
		});
		this.heroSignInLink = page
			.locator(".hero__actions")
			.getByRole("link", { name: "Sign in" });
		this.viewAllRolesLink = page.getByRole("link", { name: "View all roles" });
		this.openRolesLink = page.getByRole("link", { name: "See open roles" });
	}

	async goto() {
		await this.page.goto("/");
	}

	async clickOpenJobRoles() {
		await this.clickOpenJobRolesFromHeader();
	}

	async clickOpenJobRolesFromHero() {
		await this.heroJobRolesLink.click();
	}

	async clickSignInFromHero() {
		await this.heroSignInLink.click();
	}

	async clickViewAllJobRoles() {
		await this.viewAllRolesLink.click();
	}

	async clickViewOpenRoles() {
		await this.openRolesLink.click();
	}
}
