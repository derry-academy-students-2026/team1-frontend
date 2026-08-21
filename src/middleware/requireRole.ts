import type { NextFunction, Request, Response } from "express";
import Logger from "../lib/logger.js";
import type { UserRole } from "../models/authenticatedUser.js";

export const requireRole =
	(...allowedRoles: UserRole[]) =>
	(req: Request, res: Response, next: NextFunction): void => {
		const role = req.session?.user?.role;

		if (!role || !allowedRoles.includes(role)) {
			Logger.warn(
				`Forbidden access to ${req.originalUrl}: insufficient user role`,
			);
			res.status(403).send("Forbidden");
			return;
		}

		next();
	};

export default requireRole;
