import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const registerSchema = z
	.object({
		email: z.string().email("Enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
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

	const error = result.error.issues[0];
	const message =
		error?.path[0] === "email" && error.code === "invalid_format"
			? "Enter a valid email address"
			: error?.path[0] === "password" && error.code === "too_small"
				? "Password must be at least 8 characters"
				: error?.path[0] === "confirmPassword"
					? "Passwords do not match"
					: "Enter your email and password";

	res.render("register.njk", {
		error: message,
		email: typeof req.body.email === "string" ? req.body.email : "",
	});
}
