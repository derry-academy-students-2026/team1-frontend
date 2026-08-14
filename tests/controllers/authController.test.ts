import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../src/controllers/authController.js";

describe("AuthController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("showLogin", () => {
		it("renders the login page when not authenticated", () => {
			const render = vi.fn();
			const redirect = vi.fn();
			const req = { session: {} } as unknown as Request;
			const res = { render, redirect } as unknown as Response;

			const controller = new AuthController();
			controller.showLogin(req, res);

			expect(render).toHaveBeenCalledWith("login.njk");
			expect(redirect).not.toHaveBeenCalled();
		});

		it("redirects to /job-roles when already authenticated", () => {
			const render = vi.fn();
			const redirect = vi.fn();
			const req = {
				session: { jwtToken: "signed.jwt.token" },
			} as unknown as Request;
			const res = { render, redirect } as unknown as Response;

			const controller = new AuthController();
			controller.showLogin(req, res);

			expect(redirect).toHaveBeenCalledWith("/job-roles");
			expect(render).not.toHaveBeenCalled();
		});
	});

	describe("login", () => {
		it("stores the JWT in the session and redirects on success", async () => {
			const authApiService = {
				login: vi.fn().mockResolvedValue({
					token: "signed.jwt.token",
					user: { id: 1, email: "user@kainos.com" },
				}),
			};
			const controller = new AuthController(authApiService as never);

			const session: { jwtToken?: string } = {};
			const req = {
				body: { email: "user@kainos.com", password: "Password123!" },
				session,
			} as unknown as Request;
			const render = vi.fn();
			const redirect = vi.fn();
			const res = { render, redirect } as unknown as Response;

			await controller.login(req, res);

			expect(authApiService.login).toHaveBeenCalledWith(
				"user@kainos.com",
				"Password123!",
			);
			expect(session.jwtToken).toBe("signed.jwt.token");
			expect(redirect).toHaveBeenCalledWith("/job-roles");
			expect(render).not.toHaveBeenCalled();
		});

		it("re-renders the login page with a generic error when credentials are invalid", async () => {
			const authApiService = {
				login: vi
					.fn()
					.mockRejectedValue(new Error("Request failed with status 401")),
			};
			const controller = new AuthController(authApiService as never);

			const req = {
				body: { email: "user@kainos.com", password: "wrong" },
				session: {},
			} as unknown as Request;
			const render = vi.fn();
			const redirect = vi.fn();
			const res = { render, redirect } as unknown as Response;

			await controller.login(req, res);

			expect(render).toHaveBeenCalledWith("login.njk", {
				error: "Invalid email or password",
			});
			expect(redirect).not.toHaveBeenCalled();
		});

		it("re-renders the login page without calling the service when email is missing", async () => {
			const authApiService = { login: vi.fn() };
			const controller = new AuthController(authApiService as never);

			const req = {
				body: { password: "Password123!" },
				session: {},
			} as unknown as Request;
			const render = vi.fn();
			const res = { render } as unknown as Response;

			await controller.login(req, res);

			expect(authApiService.login).not.toHaveBeenCalled();
			expect(render).toHaveBeenCalledWith("login.njk", {
				error: "Enter your email and password",
			});
		});
	});

	describe("logout", () => {
		it("destroys the session, clears the cookie, and redirects to /login", () => {
			const destroy = vi.fn((callback: (err?: Error) => void) => callback());
			const clearCookie = vi.fn();
			const redirect = vi.fn();
			const req = { session: { destroy } } as unknown as Request;
			const res = { clearCookie, redirect } as unknown as Response;

			const controller = new AuthController();
			controller.logout(req, res);

			expect(destroy).toHaveBeenCalledTimes(1);
			expect(clearCookie).toHaveBeenCalledWith("connect.sid");
			expect(redirect).toHaveBeenCalledWith("/login");
		});
	});
});
