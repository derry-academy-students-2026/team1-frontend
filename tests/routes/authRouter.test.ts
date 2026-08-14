import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/authApiService.js", () => ({
	login: vi.fn(),
}));

import app from "../../src/app.js";
import * as authApiService from "../../src/services/authApiService.js";

describe("GET /login", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return 200 OK and render the login page", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Sign in");
	});
});

describe("POST /login", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should redirect to /job-roles on successful login", async () => {
		vi.mocked(authApiService.login).mockResolvedValue({
			token: "signed.jwt.token",
			user: { id: 1, email: "user@kainos.com" },
		});

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "user@kainos.com", password: "Password123!" });

		expect(authApiService.login).toHaveBeenCalledWith(
			"user@kainos.com",
			"Password123!",
		);
		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
	});

	it("should re-render the login page with a generic error on invalid credentials", async () => {
		vi.mocked(authApiService.login).mockRejectedValue(
			new Error("Request failed with status 401"),
		);

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "user@kainos.com", password: "wrong" });

		expect(response.status).toBe(200);
		expect(response.text).toContain("Invalid email or password");
	});
});

describe("GET /logout", () => {
	it("should redirect to /login after clearing the session", async () => {
		const response = await request(app).get("/logout");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});
});
