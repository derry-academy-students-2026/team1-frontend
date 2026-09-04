import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { validateApplication } from "../../src/middleware/applicationValidationMiddleware.js";

const validBody = {
	applicantName: "Jane Doe",
	applicantEmail: "jane@example.com",
	phoneNumber: "07700900000",
	address: "1 Example Street, Belfast",
	coverLetter: "I would love to join the team.",
	rightToWork: "yes",
	privacyConsent: "on",
};

type ApplicationSession = Request["session"] & {
	applicationErrors?: Record<string, string>;
	applicationValues?: Record<string, string>;
};

const requestWith = (body: Record<string, string>) =>
	({ params: { id: "1" }, body, session: {} }) as unknown as Request;

describe("validateApplication", () => {
	it("calls next() with normalized body when valid", () => {
		const req = requestWith(validBody);
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
		expect(req.body).toEqual({ ...validBody, linkedInUrl: undefined });
	});

	it("redirects back with field errors and preserved input in the session", () => {
		const req = requestWith({ ...validBody, applicantName: "" });
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(redirect).toHaveBeenCalledWith("/job-roles/1/apply");
		expect((req.session as ApplicationSession).applicationErrors).toEqual({
			applicantName: "Enter your full name",
		});
		expect(
			(req.session as ApplicationSession).applicationValues?.applicantEmail,
		).toBe("jane@example.com");
	});

	it("redirects back with an error when the email is invalid", () => {
		const req = requestWith({ ...validBody, applicantEmail: "not-an-email" });
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(redirect).toHaveBeenCalledWith("/job-roles/1/apply");
		expect((req.session as ApplicationSession).applicationErrors).toEqual({
			applicantEmail:
				"Enter an email address in the correct format, like name@example.com",
		});
	});

	it("redirects back with an error when a required field is missing", () => {
		const req = requestWith({ ...validBody, phoneNumber: "" });
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(redirect).toHaveBeenCalledWith("/job-roles/1/apply");
		expect((req.session as ApplicationSession).applicationErrors).toEqual({
			phoneNumber: "Enter your phone number",
		});
	});

	it("redirects back with an error when the phone format is invalid", () => {
		const req = requestWith({ ...validBody, phoneNumber: "not-a-phone" });
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect((req.session as ApplicationSession).applicationErrors).toEqual({
			phoneNumber:
				"Enter a telephone number, like 07700 900123 or +44 808 157 0192",
		});
	});

	it("trims the name and lowercases the email", () => {
		const req = requestWith({
			...validBody,
			applicantName: " Jane Doe ",
			applicantEmail: "JANE@EXAMPLE.COM",
		});
		const next = vi.fn() as NextFunction;

		validateApplication(
			req,
			{ redirect: vi.fn() } as unknown as Response,
			next,
		);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.body.applicantName).toBe("Jane Doe");
		expect(req.body.applicantEmail).toBe("jane@example.com");
	});

	it("accepts submission without an upload", () => {
		const req = requestWith(validBody);
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
	});

	it("accepts an optional linkedInUrl when provided", () => {
		const req = requestWith({
			...validBody,
			linkedInUrl: "https://linkedin.com/in/jane",
		});
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.body.linkedInUrl).toBe("https://linkedin.com/in/jane");
	});

	it("adds https to a LinkedIn URL without a protocol", () => {
		const req = requestWith({
			...validBody,
			linkedInUrl: "www.linkedin.com/in/jane",
		});
		const next = vi.fn() as NextFunction;

		validateApplication(
			req,
			{ redirect: vi.fn() } as unknown as Response,
			next,
		);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.body.linkedInUrl).toBe("https://www.linkedin.com/in/jane");
	});

	it("rejects a non-LinkedIn URL", () => {
		const req = requestWith({
			...validBody,
			linkedInUrl: "https://example.com/profile",
		});
		const next = vi.fn() as NextFunction;

		validateApplication(
			req,
			{ redirect: vi.fn() } as unknown as Response,
			next,
		);

		expect(next).not.toHaveBeenCalled();
		expect((req.session as ApplicationSession).applicationErrors).toEqual({
			linkedInUrl:
				"Enter a LinkedIn profile URL, like https://www.linkedin.com/in/your-name",
		});
	});
});
