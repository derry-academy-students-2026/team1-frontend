import type { NextFunction, Request, Response } from "express";
import Logger from "../lib/logger.js";

/**
 * Blocks a route when its feature flag is off, hiding it rather than advertising
 * that it exists but is disabled.
 */
export const requireFeature =
	(name: string, isEnabled: () => boolean) =>
	(req: Request, res: Response, next: NextFunction): void => {
		if (!isEnabled()) {
			Logger.info(`Blocked ${req.path}: feature "${name}" is disabled`);
			res.sendStatus(404);
			return;
		}
		next();
	};
