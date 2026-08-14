import type { NextFunction, Request, Response } from "express";
import Logger from "../lib/logger.js";

/**
 * Express middleware that blocks access to pages needing a backend JWT.
 * Unauthenticated visitors are redirected to the login page.
 */
export const requireAuth = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	if (!req.session?.jwtToken) {
		Logger.warn(`Unauthenticated access to ${req.originalUrl}, redirecting`);
		res.redirect("/login");
		return;
	}
	next();
};

export default requireAuth;
