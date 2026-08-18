import { testUser } from "./fixtures/test-data";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";
const AUTH_LOGIN_PATH = process.env.AUTH_LOGIN_PATH ?? "/auth/login";

/**
 * Confirms the real backend is reachable and seeded with the e2e test user
 * before any spec runs, so a misconfigured environment fails once with a
 * clear message instead of every spec failing individually at login.
 */
export default async function globalSetup() {
	const loginUrl = `${BACKEND_URL}${AUTH_LOGIN_PATH}`;
	let response: Response;

	try {
		response = await fetch(loginUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(testUser),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Could not reach the backend API at ${BACKEND_URL}. Start it before running the e2e suite. (${message})`,
		);
	}

	if (!response.ok) {
		throw new Error(
			`Backend login check failed with status ${response.status} at ${loginUrl}. ` +
				"Confirm the backend is running its seed script so the e2e test user exists (see e2e/fixtures/test-data.ts).",
		);
	}
}
