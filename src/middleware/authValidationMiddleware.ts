import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const registerSchema = z
	.object({
		email: z.string().min(1),
		password: z.string().min(1),
		confirmPassword: z.string().min(1),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export function validateRegistration(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const result = registerSchema.safeParse(req.body);

	if (result.success) {
		req.body = result.data;
		next();
		return;
	}

	const hasMissingCredentials = result.error.issues.some(
		(issue) =>
			(issue.path[0] === "email" || issue.path[0] === "password") &&
			issue.code === "too_small",
	);

	res.render("register.njk", {
		error: hasMissingCredentials
			? "Enter your email and password"
			: "Passwords do not match",
		email: typeof req.body.email === "string" ? req.body.email : "",
	});
}
