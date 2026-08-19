import type { Locator, Page } from "@playwright/test";

/**
 * Shared controls rendered by the base page layout.
 */
export class BasePage {
	readonly page: Page;
	readonly skipToMainContentLink: Locator;
	readonly logoLink: Locator;
	readonly headerHomeLink: Locator;
	readonly headerJobRolesLink: Locator;
	readonly headerSignInLink: Locator;
	readonly headerSignOutLink: Locator;
	readonly footerHomeLink: Locator;
	readonly footerJobRolesLink: Locator;
	readonly contactEmailLink: Locator;
	readonly contactPhoneLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.skipToMainContentLink = page.getByRole("link", {
			name: "Skip to main content",
		});
		this.logoLink = page.getByRole("link", { name: "Kainos home" });

		const mainNavigation = page.getByRole("navigation", {
			name: "Main navigation",
		});
		this.headerHomeLink = mainNavigation.getByRole("link", { name: "Home" });
		this.headerJobRolesLink = mainNavigation.getByRole("link", {
			name: "Job roles",
		});
		this.headerSignInLink = mainNavigation.getByRole("link", {
			name: "Sign in",
		});
		this.headerSignOutLink = mainNavigation.getByRole("link", {
			name: "Sign out",
		});

		const footer = page.locator("footer");
		this.footerHomeLink = footer.getByRole("link", { name: "Home" });
		this.footerJobRolesLink = footer.getByRole("link", { name: "Job roles" });
		this.contactEmailLink = footer.getByRole("link", {
			name: "careers@kainos.com",
		});
		this.contactPhoneLink = footer.getByRole("link", {
			name: "+44 (0)28 9036 7000",
		});
	}

	async skipToMainContent() {
		await this.skipToMainContentLink.focus();
		await this.skipToMainContentLink.press("Enter");
	}

	async openHomeFromLogo() {
		await this.logoLink.click();
	}

	async openHomeFromHeader() {
		await this.headerHomeLink.click();
	}

	async openJobRolesFromHeader() {
		await this.headerJobRolesLink.click();
	}

	async openLoginFromHeader() {
		await this.headerSignInLink.click();
	}

	async signOutFromHeader() {
		await this.headerSignOutLink.click();
	}

	async openHomeFromFooter() {
		await this.footerHomeLink.click();
	}

	async openJobRolesFromFooter() {
		await this.footerJobRolesLink.click();
	}

	async contactByEmail() {
		await this.contactEmailLink.click();
	}

	async contactByPhone() {
		await this.contactPhoneLink.click();
	}
}
