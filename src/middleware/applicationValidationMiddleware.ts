import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { hasValidCvSignature } from "../lib/fileSignature.js";

const optionalText = (max: number) =>
	z
		.string()
		.max(max)
		.optional()
		.or(z.literal("").transform(() => undefined));

const requiredText = (max: number, message: string) =>
	z.string().min(1, message).max(max);

const applicationSchema = z.object({
	applicantName: z.string().min(1, "Enter your full name"),
	applicantEmail: z.string().email("Enter a valid email address"),
	phoneNumber: requiredText(30, "Enter your phone number"),
	address: requiredText(300, "Enter your home address"),
	linkedInUrl: optionalText(300),
	coverLetter: requiredText(
		2000,
		"Enter a cover letter or additional information",
	),
});

const fieldMessages: Record<string, string> = {
	applicantEmail: "Enter a valid email address",
	applicantName: "Enter your full name",
	phoneNumber: "Enter your phone number",
	address: "Enter your home address",
	coverLetter: "Enter a cover letter or additional information",
};

export function validateApplication(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const result = applicationSchema.safeParse(req.body);
	const cvIsValid = !req.file || hasValidCvSignature(req.file);

	if (result.success && cvIsValid) {
		req.body = result.data;
		next();
		return;
	}

	const error = result.error?.issues[0];
	const message = !result.success
		? (fieldMessages[String(error?.path[0])] ??
			"Check the details you entered and try again")
		: "That file does not look like a valid PDF or Word document";

	const preserved = (field: string) =>
		typeof req.body[field] === "string" ? req.body[field] : "";

	const params = new URLSearchParams({
		applyError: message,
		applicantName: preserved("applicantName"),
		applicantEmail: preserved("applicantEmail"),
		phoneNumber: preserved("phoneNumber"),
		address: preserved("address"),
		linkedInUrl: preserved("linkedInUrl"),
		coverLetter: preserved("coverLetter"),
	});
	res.redirect(`/job-roles/${req.params.id}/apply?${params.toString()}`);
}
