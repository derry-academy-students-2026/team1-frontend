import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import * as authApiService from "../services/authApiService.js";

export class AuthController {
	/**
	 * Initializes the controller with an auth service dependency.
	 * @param authApiServiceImpl - Service instance for authenticating users (injectable for testing)
	 */
	constructor(private readonly authApiServiceImpl = authApiService) {}

	/**
	 * Handles GET /login by rendering the login page.
	 * Redirects already-authenticated users to the job roles list.
	 */
	showLogin(req: Request, res: Response) {
		if (req.session.jwtToken) {
			res.redirect("/job-roles");
			return;
		}
		res.render("login.njk");
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

	/**
	 * Handles GET /logout by clearing the session and redirecting to the login page.
	 */
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
