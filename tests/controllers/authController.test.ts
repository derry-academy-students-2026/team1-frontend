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

	describe("showRegister", () => {
		it("renders the registration page when not authenticated", () => {
			const render = vi.fn();
			const redirect = vi.fn();
			const req = { session: {} } as unknown as Request;
			const res = { render, redirect } as unknown as Response;

			const controller = new AuthController();
			controller.showRegister(req, res);

			expect(render).toHaveBeenCalledWith("register.njk");
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
			controller.showRegister(req, res);

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

	describe("register", () => {
		it("stores the JWT in the session and redirects on success", async () => {
			const authApiService = {
				register: vi.fn().mockResolvedValue({ token: "new.jwt.token" }),
			};
			const controller = new AuthController(authApiService as never);

			const session: { jwtToken?: string } = {};
			const req = {
				body: {
					email: "newuser@kainos.com",
					password: "Password123!",
					confirmPassword: "Password123!",
				},
				session,
			} as unknown as Request;
			const render = vi.fn();
			const redirect = vi.fn();
			const res = { render, redirect } as unknown as Response;

			await controller.register(req, res);

			expect(authApiService.register).toHaveBeenCalledWith(
				"newuser@kainos.com",
				"Password123!",
			);
			expect(session.jwtToken).toBe("new.jwt.token");
			expect(redirect).toHaveBeenCalledWith("/job-roles");
			expect(render).not.toHaveBeenCalled();
		});

		it("surfaces the backend message for a validation error", async () => {
			const axiosError = new Error(
				"Request failed with status 400",
			) as Error & {
				response?: { status?: number; data?: { message?: string } };
			};
			axiosError.response = {
				status: 400,
				data: { message: "Enter a valid email address" },
			};

			const authApiService = {
				register: vi.fn().mockRejectedValue(axiosError),
			};
			const controller = new AuthController(authApiService as never);

			const req = {
				body: {
					email: "bad-email",
					password: "Password123!",
					confirmPassword: "Password123!",
				},
				session: {},
			} as unknown as Request;
			const render = vi.fn();
			const res = { render } as unknown as Response;

			await controller.register(req, res);

			expect(render).toHaveBeenCalledWith("register.njk", {
				error: "Enter a valid email address",
				email: "bad-email",
			});
		});

		it("surfaces the backend message for a duplicate email", async () => {
			const authApiService = {
				register: vi.fn().mockRejectedValue({
					response: {
						status: 409,
						data: { message: "An account with this email already exists" },
					},
				}),
			};
			const controller = new AuthController(authApiService as never);

			const req = {
				body: {
					email: "duplicate@kainos.com",
					password: "Password123!",
					confirmPassword: "Password123!",
				},
				session: {},
			} as unknown as Request;
			const render = vi.fn();
			const res = { render } as unknown as Response;

			await controller.register(req, res);

			expect(render).toHaveBeenCalledWith("register.njk", {
				error: "An account with this email already exists",
				email: "duplicate@kainos.com",
			});
		});

		it("uses a generic message for unexpected registration failures", async () => {
			const authApiService = {
				register: vi.fn().mockRejectedValue({
					response: {
						status: 500,
						data: { message: "Failed to process registration" },
					},
				}),
			};
			const controller = new AuthController(authApiService as never);

			const req = {
				body: {
					email: "user@kainos.com",
					password: "Password123!",
					confirmPassword: "Password123!",
				},
				session: {},
			} as unknown as Request;
			const render = vi.fn();
			const res = { render } as unknown as Response;

			await controller.register(req, res);

			expect(render).toHaveBeenCalledWith("register.njk", {
				error: "Something went wrong, please try again",
				email: "user@kainos.com",
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
