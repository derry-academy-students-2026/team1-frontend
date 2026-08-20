import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import * as authApiService from "../services/authApiService.js";

export class AuthController {
	constructor(private readonly authApiServiceImpl = authApiService) {}

	showLogin(req: Request, res: Response) {
		if (req.session.jwtToken) {
			res.redirect("/job-roles");
			return;
		}
		res.render("login.njk");
	}

	showRegister(req: Request, res: Response) {
		if (req.session.jwtToken) {
			res.redirect("/job-roles");
			return;
		}
		res.render("register.njk");
	}
	
	/**
	 * Handles POST /login by validating input, authenticating with the backend,
	 * and storing the returned JWT in the browser session.
	 */
	async login(req: Request, res: Response) {
		Logger.debug("🌐 [POST /login] Received login request");

		const { email, password } = req.body as {
			email?: string;
			password?: string;
		};

		if (!email || !password) {
			Logger.warn("⚠️  [POST /login] Missing email or password | Status: 400");
			res.render("login.njk", {
				error: "Enter your email and password",
			});
			return;
		}

		try {
			const { token } = await this.authApiServiceImpl.login(email, password);
			req.session.jwtToken = token;
			Logger.info("✅ [POST /login] Login successful | Status: 302");
			res.redirect("/job-roles");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			Logger.warn(`Login failed for ${email}: ${message}`);
			res.render("login.njk", {
				error: "Invalid email or password",
			});
		}
	}

	async register(req: Request, res: Response) {
		Logger.debug("🌐 [POST /register] Received registration request");

		const { email, password } = req.body as {
			email: string;
			password: string;
		};

		try {
			const { token } = await this.authApiServiceImpl.register(email, password);
			req.session.jwtToken = token;
			Logger.info("✅ [POST /register] Registration successful | Status: 302");
			res.redirect("/job-roles");
		} catch (error) {
			const axiosError =
				error && typeof error === "object" && "response" in error
					? (error as {
							response?: { status?: number; data?: { message?: string } };
						})
					: undefined;
			const backendMessage = axiosError?.response?.data?.message;
			const status = axiosError?.response?.status;
			const message =
				status === 400 || status === 409
					? (backendMessage ?? "Something went wrong, please try again")
					: "Something went wrong, please try again";

			Logger.warn(
				`Registration failed for ${email}: ${status ?? "unknown status"} ${message}`,
			);
			res.render("register.njk", {
				error: message,
				email,
			});
		}
	}

	logout(req: Request, res: Response) {
		req.session.destroy((error) => {
			if (error) {
				Logger.error(`Failed to destroy session: ${error.message}`);
			}
			res.clearCookie("connect.sid");
			res.redirect("/login");
		});
	}
}
