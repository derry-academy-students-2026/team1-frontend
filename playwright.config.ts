import { defineConfig, devices } from "@playwright/test";

const APP_PORT = 3000;
// The real backend API is expected to already be running at this URL before tests start.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./e2e/tests",
	/* Verifies the backend is up and seeded before the suite starts. */
	globalSetup: "./e2e/global-setup.ts",
	/* Runs once after the whole suite finishes. */
	globalTeardown: "./e2e/global-teardown.ts",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: "html",
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/login')`. */
		baseURL: `http://localhost:${APP_PORT}`,

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},

		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},

		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
	],

	/* Start the app under test before running the suite. The backend API must already be running. */
	webServer: {
		command: "npx tsx src/index.ts",
		url: `http://localhost:${APP_PORT}/login`,
		reuseExistingServer: !process.env.CI,
		env: {
			PORT: String(APP_PORT),
			API_BASE_URL: BACKEND_URL,
			SESSION_SECRET: "e2e-test-session-secret",
		},
	},
});
