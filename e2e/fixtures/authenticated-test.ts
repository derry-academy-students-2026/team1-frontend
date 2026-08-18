import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { testUser } from "./test-data";

export const test = base.extend({
	authenticatedPage: [
		async ({ page }, use) => {
			const loginPage = new LoginPage(page);
			await loginPage.goto();
			await loginPage.login(testUser.email, testUser.password);
			await use(page);
		},
		{ auto: true },
	],
});

export { expect };
