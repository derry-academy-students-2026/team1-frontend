import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const jobRoleIdSchema = z.coerce.number().int().positive();

/** Rejects requests whose :id route param is not a positive integer. */
export function validateJobRoleId(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (!jobRoleIdSchema.safeParse(req.params.id).success) {
		res.status(404).send("Job role not found");
		return;
	}

	next();
}
