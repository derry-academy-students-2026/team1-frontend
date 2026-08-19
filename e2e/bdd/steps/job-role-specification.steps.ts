import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "./login.steps.js";

Given(
	"the user is logged in and on the job roles page",
	async function (this: CustomWorld) {
		await this.homePage.goto();
		await this.homePage.clickSignInFromHero();
		await this.loginPage.enterEmail("test1@example.com");
		await this.loginPage.enterPassword("Password123!");
		await this.loginPage.clickSubmit();
		await expect(this.page).toHaveURL(/\/job-roles$/);
		await expect(this.jobRolesListPage.heading).toBeVisible();
	},
);

When(
	"the user clicks on the job role name {string}",
	async function (this: CustomWorld, roleName: string) {
		await this.jobRolesListPage.clickOpenRole(roleName);
	},
);

Then(
	"the job role specification page is displayed",
	async function (this: CustomWorld) {
		await expect(this.page).toHaveURL(/\/job-roles\/\d+$/);
	},
);

Then(
	"the page shows the role title {string}",
	async function (this: CustomWorld, roleName: string) {
		await expect(
			this.page.getByRole("heading", { name: roleName, level: 1 }),
		).toBeVisible();
	},
);

Then(
	"the page shows the specification content for that role",
	async function (this: CustomWorld) {
		await expect(
			this.page.getByRole("heading", { name: "Description" }),
		).toBeVisible();
		await expect(
			this.page.getByRole("heading", { name: "Responsibilities" }),
		).toBeVisible();
	},
);

Given(
	"the user is on the specification page for {string}",
	async function (this: CustomWorld, roleName: string) {
		await this.homePage.goto();
		await this.homePage.clickSignInFromHero();
		await this.loginPage.enterEmail("test1@example.com");
		await this.loginPage.enterPassword("Password123!");
		await this.loginPage.clickSubmit();
		await this.jobRolesListPage.clickOpenRole(roleName);
		await expect(this.page).toHaveURL(/\/job-roles\/\d+$/);
	},
);

When("the user clicks the back link", async function (this: CustomWorld) {
	await this.page.getByRole("link", { name: "Back to job roles" }).click();
});

Then(
	"the user is taken back to the job roles page",
	async function (this: CustomWorld) {
		await expect(this.page).toHaveURL(/\/job-roles$/);
		await expect(this.jobRolesListPage.heading).toBeVisible();
	},
);
