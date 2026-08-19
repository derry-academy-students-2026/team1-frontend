import {
	After,
	AfterAll,
	Before,
	BeforeAll,
	Given,
	Status,
	setDefaultTimeout,
	setWorldConstructor,
	Then,
	When,
	World,
} from "@cucumber/cucumber";
import { type Browser, chromium, expect, type Page } from "@playwright/test";
import { urls } from "../../fixtures/test-data.js";
import { HomePage } from "../../pages/home-page.js";
import { JobRolesListPage } from "../../pages/job-roles-list-page.js";
import { LoginPage } from "../../pages/login-page.js";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

setDefaultTimeout(15_000);

class CustomWorld extends World {
	page!: Page;
	homePage!: HomePage;
	loginPage!: LoginPage;
	jobRolesListPage!: JobRolesListPage;

	init(page: Page) {
		this.page = page;
		this.homePage = new HomePage(page);
		this.loginPage = new LoginPage(page);
		this.jobRolesListPage = new JobRolesListPage(page);
	}
}

setWorldConstructor(CustomWorld);

let browser: Browser;

// The app and backend are expected to already be running, same as the Playwright suite.
BeforeAll(async () => {
	browser = await chromium.launch();
});

AfterAll(async () => {
	await browser.close();
});

Before(async function (this: CustomWorld) {
	const context = await browser.newContext({ baseURL: BASE_URL });
	const page = await context.newPage();
	this.init(page);
});

After(async function (this: CustomWorld, { result }) {
	if (result?.status === Status.FAILED) {
		const screenshot = await this.page.screenshot();
		this.attach(screenshot, "image/png");
	}
	await this.page.context().close();
});

Given("the user is on the home page", async function (this: CustomWorld) {
	await this.homePage.goto();
});

When("the user clicks on the login button", async function (this: CustomWorld) {
	await this.homePage.clickSignInFromHero();
});

Then("the login page is displayed", async function (this: CustomWorld) {
	await expect(
		this.page,
		"User should be redirected to the login page",
	).toHaveURL(urls.login);
});

When(
	"the user enters the email {string}",
	async function (this: CustomWorld, email: string) {
		await this.loginPage.enterEmail(email);
	},
);

When(
	"enters the password {string}",
	async function (this: CustomWorld, password: string) {
		await this.loginPage.enterPassword(password);
	},
);

When("clicks the login button", async function (this: CustomWorld) {
	await this.loginPage.clickSubmit();
});

Then(
	"the user is logged in and taken to the job-roles page",
	async function (this: CustomWorld) {
		await expect(this.page, "User should be on the job roles page").toHaveURL(
			urls.jobRoles,
		);
		await expect(
			this.jobRolesListPage.heading,
			"Job roles heading should be visible after login",
		).toBeVisible();
	},
);

Then(
	"the user is presented with an invalid credentials message",
	async function (this: CustomWorld) {
		await expect(
			this.loginPage.errorMessage,
			"Invalid credentials error message should be visible",
		).toBeVisible();
	},
);
