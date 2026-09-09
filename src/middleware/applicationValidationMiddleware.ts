import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const applicationSchema = z.object({
	applicantName: z
		.string()
		.trim()
		.min(1, "Enter your full name")
		.min(2, "Full name must be at least 2 characters")
		.max(100, "Full name must be 100 characters or less")
		.regex(
			/^[\p{L}\p{M}\s'’.-]+$/u,
			"Full name can only include letters, spaces, hyphens and apostrophes",
		),
	applicantEmail: z
		.string()
		.trim()
		.toLowerCase()
		.min(1, "Enter your email address")
		.max(255, "Email address must be 255 characters or less")
		.email(
			"Enter an email address in the correct format, like name@example.com",
		),
	phoneNumber: z
		.string()
		.trim()
		.min(1, "Enter your phone number")
		.max(30, "Phone number must be 30 characters or less")
		.regex(
			/^[0-9\s()+-]+$/,
			"Enter a telephone number, like 07700 900123 or +44 808 157 0192",
		)
		.refine(
			(value) => value.replace(/\D/g, "").length >= 10,
			"Enter a telephone number, like 07700 900123 or +44 808 157 0192",
		),
	address: z
		.string()
		.trim()
		.min(1, "Enter your home address")
		.max(300, "Home address must be 300 characters or less"),
	linkedInUrl: z
		.string()
		.trim()
		.max(300, "LinkedIn URL must be 300 characters or less")
		.transform((value) =>
			value
				? value.startsWith("http://") || value.startsWith("https://")
					? value
					: `https://${value}`
				: undefined,
		)
		.optional()
		.refine((value) => {
			if (!value) return true;
			try {
				const url = new URL(value);
				return (
					url.hostname === "linkedin.com" ||
					url.hostname.endsWith(".linkedin.com")
				);
			} catch {
				return false;
			}
		}, "Enter a LinkedIn profile URL, like https://www.linkedin.com/in/your-name"),
	coverLetter: z
		.string()
		.trim()
		.min(1, "Enter a cover letter or additional information")
		.max(2000, "Cover letter must be 2000 characters or less"),
	rightToWork: z.enum(["yes", "no"], {
		message: "Select whether you have the right to work in the UK/Ireland",
	}),
	privacyConsent: z.literal("on", {
		error: "Consent is required to submit your application",
	}),
});

const fieldMessages: Record<string, string> = {
	applicantName: "Enter your full name",
	applicantEmail: "Enter your email address",
	phoneNumber: "Enter your phone number",
	address: "Enter your home address",
	linkedInUrl:
		"Enter a LinkedIn profile URL, like https://www.linkedin.com/in/your-name",
	coverLetter: "Enter a cover letter or additional information",
};

export function validateApplication(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const result = applicationSchema.safeParse(req.body);

	if (result.success) {
		req.body = result.data;
		next();
		return;
	}

	const preserved = (field: string) =>
		typeof req.body[field] === "string" ? req.body[field] : "";

	const errors = result.error.issues.reduce<Record<string, string>>(
		(fieldErrors, issue) => {
			const field = String(issue.path[0]);
			if (!fieldErrors[field]) {
				fieldErrors[field] = issue.message || fieldMessages[field];
			}
			return fieldErrors;
		},
		{},
	);

	req.session.applicationErrors = errors;
	req.session.applicationValues = {
		applicantName: preserved("applicantName"),
		applicantEmail: preserved("applicantEmail"),
		phoneNumber: preserved("phoneNumber"),
		address: preserved("address"),
		linkedInUrl: preserved("linkedInUrl"),
		coverLetter: preserved("coverLetter"),
		rightToWork: preserved("rightToWork"),
		privacyConsent: preserved("privacyConsent"),
	};
	res.redirect(`/job-roles/${req.params.id}/apply`);
}
