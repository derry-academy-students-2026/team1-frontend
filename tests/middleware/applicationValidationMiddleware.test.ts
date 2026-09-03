import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { validateApplication } from "../../src/middleware/applicationValidationMiddleware.js";

const validBody = {
	applicantName: "Jane Doe",
	applicantEmail: "jane@example.com",
	phoneNumber: "07700900000",
	address: "1 Example Street, Belfast",
	coverLetter: "I would love to join the team.",
};
const cvFile = {
	originalname: "cv.pdf",
	mimetype: "application/pdf",
	buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
} as Express.Multer.File;

describe("validateApplication", () => {
	it("calls next() with normalized body when valid", () => {
		const req = {
			params: { id: "1" },
			body: validBody,
			file: cvFile,
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
		expect(req.body).toEqual({ ...validBody, linkedInUrl: undefined });
	});

	it("redirects back with an error and preserved input when the name is missing", () => {
		const req = {
			params: { id: "1" },
			body: { ...validBody, applicantName: "" },
			file: cvFile,
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(redirect).toHaveBeenCalledWith(
			expect.stringContaining("/job-roles/1/apply?"),
		);
		const redirectUrl = redirect.mock.calls[0][0] as string;
		expect(redirectUrl).toContain("applyError=Enter+your+full+name");
		expect(redirectUrl).toContain("applicantEmail=jane%40example.com");
	});

	it("redirects back with an error when the email is invalid", () => {
		const req = {
			params: { id: "1" },
			body: { ...validBody, applicantEmail: "not-an-email" },
			file: cvFile,
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).not.toHaveBeenCalled();
		const redirectUrl = redirect.mock.calls[0][0] as string;
		expect(redirectUrl).toContain("applyError=Enter+a+valid+email+address");
		expect(redirectUrl).toContain("applicantName=Jane+Doe");
	});

	it("redirects back with an error when a required field is missing", () => {
		const req = {
			params: { id: "1" },
			body: { ...validBody, phoneNumber: "" },
			file: cvFile,
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).not.toHaveBeenCalled();
		const redirectUrl = redirect.mock.calls[0][0] as string;
		expect(redirectUrl).toContain("applyError=Enter+your+phone+number");
	});

	it("accepts submission with no CV file attached", () => {
		const req = {
			params: { id: "1" },
			body: validBody,
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(redirect).not.toHaveBeenCalled();
	});

	it("redirects back with an error when the CV file's content does not match its claimed type", () => {
		const req = {
			params: { id: "1" },
			body: validBody,
			file: {
				originalname: "cv.pdf",
				mimetype: "application/pdf",
				buffer: Buffer.from("not actually a pdf"),
			} as Express.Multer.File,
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).not.toHaveBeenCalled();
		const redirectUrl = redirect.mock.calls[0][0] as string;
		expect(redirectUrl).toContain(
			"applyError=That+file+does+not+look+like+a+valid+PDF+or+Word+document",
		);
	});

	it("accepts an optional linkedInUrl when provided", () => {
		const req = {
			params: { id: "1" },
			body: { ...validBody, linkedInUrl: "https://linkedin.com/in/jane" },
			file: cvFile,
		} as unknown as Request;
		const redirect = vi.fn();
		const res = { redirect } as unknown as Response;
		const next = vi.fn() as NextFunction;

		validateApplication(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(req.body.linkedInUrl).toBe("https://linkedin.com/in/jane");
	});
});
