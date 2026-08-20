import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/authApiService.js", () => ({
	login: vi.fn(),
	register: vi.fn(),
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

describe("GET /register", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return 200 OK and render the registration page", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Create an account");
	});
});

describe("POST /register", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should redirect to /job-roles on successful registration", async () => {
		vi.mocked(authApiService.register).mockResolvedValue({
			token: "new.jwt.token",
		});

		const response = await request(app).post("/register").type("form").send({
			email: "newuser@kainos.com",
			password: "Password123!",
			confirmPassword: "Password123!",
		});

		expect(authApiService.register).toHaveBeenCalledWith(
			"newuser@kainos.com",
			"Password123!",
		);
		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
	});

	it("should re-render the registration page with the backend validation message", async () => {
		vi.mocked(authApiService.register).mockRejectedValue(
			Object.assign(new Error("Request failed with status 400"), {
				response: {
					status: 400,
					data: { message: "Enter a valid email address" },
				},
			}),
		);

		const response = await request(app).post("/register").type("form").send({
			email: "bad-email",
			password: "Password123!",
			confirmPassword: "Password123!",
		});

		expect(response.status).toBe(200);
		expect(response.text).toContain("Enter a valid email address");
	});
});

describe("GET /logout", () => {
	it("should redirect to /login after clearing the session", async () => {
		const response = await request(app).get("/logout");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});
});
