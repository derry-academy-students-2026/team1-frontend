import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../src/controllers/applicationController.js";
import * as applicationApiService from "../../src/services/applicationApiService.js";
import * as jobRoleApiService from "../../src/services/jobRoleApiService.js";

vi.mock("../../src/services/applicationApiService.js");
vi.mock("../../src/services/jobRoleApiService.js");

describe("ApplicationController", () => {
	const jobRole = {
		id: 1,
		roleName: "Software Engineer",
		description: "Build software products.",
		responsibilities: "Design, build and test software.",
		sharepointUrl: "https://sharepoint.example.com/software-engineer",
		location: "Belfast",
		capability: { id: 1, name: "Engineering" },
		band: { id: 2, name: "Band 2" },
		closingDate: new Date("2026-08-30"),
		status: { id: 1, name: "open" },
		numberOfOpenPositions: 2,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("applyForRole", () => {
		it("submits the application, records the applied role and redirects with a success flash", async () => {
			vi.mocked(applicationApiService.applyForJobRole).mockResolvedValue({
				id: 1,
				roleId: 1,
				applicantName: "Jane Doe",
				applicantEmail: "jane@example.com",
				phoneNumber: "07700900000",
				address: "1 Example Street",
				coverLetter: "I would like to apply.",
				rightToWork: "yes",
				privacyConsent: "on",
				status: "in progress",
				createdAt: new Date("2026-09-03"),
			});

			const controller = new ApplicationController();
			const redirect = vi.fn();
			const response = { redirect } as unknown as Response;
			const session: { jwtToken: string; appliedJobRoleIds?: number[] } = {
				jwtToken: "test-token",
			};

			await controller.applyForRole(
				{
					params: { id: "1" },
					body: {
						applicantName: "Jane Doe",
						applicantEmail: "jane@example.com",
						phoneNumber: "07700900000",
						address: "1 Example Street",
						coverLetter: "I would like to apply.",
						rightToWork: "yes",
						privacyConsent: "on",
					},
					session,
				} as unknown as Request,
				response,
			);

			expect(applicationApiService.applyForJobRole).toHaveBeenCalledWith(
				1,
				{
					applicantName: "Jane Doe",
					applicantEmail: "jane@example.com",
					phoneNumber: "07700900000",
					address: "1 Example Street",
					linkedInUrl: undefined,
					coverLetter: "I would like to apply.",
					rightToWork: "yes",
					privacyConsent: "on",
				},
				"test-token",
			);
			expect(session.appliedJobRoleIds).toEqual([1]);
			expect(redirect).toHaveBeenCalledWith("/job-roles/1/apply/confirmation");
		});

		it("redirects to /logout when the backend rejects the session token", async () => {
			vi.mocked(applicationApiService.applyForJobRole).mockRejectedValue({
				response: { status: 401 },
			});

			const controller = new ApplicationController();
			const redirect = vi.fn();
			const response = { redirect } as unknown as Response;

			await controller.applyForRole(
				{
					params: { id: "1" },
					body: {
						applicantName: "Jane Doe",
						applicantEmail: "jane@example.com",
					},
					session: {},
				} as unknown as Request,
				response,
			);

			expect(redirect).toHaveBeenCalledWith("/logout");
		});

		it("redirects back with an error flash on a duplicate application (409)", async () => {
			vi.mocked(applicationApiService.applyForJobRole).mockRejectedValue({
				response: { status: 409 },
			});

			const controller = new ApplicationController();
			const redirect = vi.fn();
			const response = { redirect } as unknown as Response;

			await controller.applyForRole(
				{
					params: { id: "1" },
					body: {
						applicantName: "Jane Doe",
						applicantEmail: "jane@example.com",
					},
					session: {},
				} as unknown as Request,
				response,
			);

			expect(redirect).toHaveBeenCalledWith("/job-roles/1/apply");
		});

		it("preserves the backend message for invalid application data (400)", async () => {
			vi.mocked(applicationApiService.applyForJobRole).mockRejectedValue({
				response: {
					status: 400,
					data: { message: "Enter a valid LinkedIn profile URL" },
				},
			});

			const controller = new ApplicationController();
			const redirect = vi.fn();
			const response = { redirect } as unknown as Response;
			const req = {
				params: { id: "1" },
				body: {},
				session: {},
			} as unknown as Request;

			await controller.applyForRole(req, response);

			expect(
				(
					req.session as Request["session"] & {
						applicationErrors?: Record<string, string>;
					}
				).applicationErrors,
			).toEqual({
				_form: "Enter a valid LinkedIn profile URL",
			});
			expect(redirect).toHaveBeenCalledWith("/job-roles/1/apply");
		});

		it("redirects back with a generic error flash on unexpected failures", async () => {
			vi.mocked(applicationApiService.applyForJobRole).mockRejectedValue(
				new Error("Network error"),
			);

			const controller = new ApplicationController();
			const redirect = vi.fn();
			const response = { redirect } as unknown as Response;

			await controller.applyForRole(
				{
					params: { id: "1" },
					body: {
						applicantName: "Jane Doe",
						applicantEmail: "jane@example.com",
					},
					session: {},
				} as unknown as Request,
				response,
			);

			expect(redirect).toHaveBeenCalledWith("/job-roles/1/apply");
		});
	});

	describe("getApplyForm", () => {
		it("renders apply-for-role.njk with the job role and empty flash state", async () => {
			vi.mocked(jobRoleApiService.getJobRoleById).mockResolvedValue(jobRole);

			const controller = new ApplicationController();
			const render = vi.fn();
			const response = { render } as unknown as Response;

			await controller.getApplyForm(
				{
					params: { id: "1" },
					session: { jwtToken: "test-token" },
				} as unknown as Request,
				response,
			);

			expect(jobRoleApiService.getJobRoleById).toHaveBeenCalledWith(
				1,
				"test-token",
			);
			expect(render).toHaveBeenCalledWith("apply-for-role.njk", {
				jobRole,
				applicationErrors: undefined,
			});
		});

		it("passes through the applyError flash and preserved input", async () => {
			vi.mocked(jobRoleApiService.getJobRoleById).mockResolvedValue(jobRole);

			const controller = new ApplicationController();
			const render = vi.fn();
			const response = { render } as unknown as Response;

			const req = {
				params: { id: "1" },
				session: {
					applicationErrors: {
						applicantEmail: "Enter a valid email address",
					},
					applicationValues: {
						applicantName: "Jane Doe",
						applicantEmail: "not-an-email",
					},
				},
			} as unknown as Request;

			await controller.getApplyForm(req, response);

			expect(render).toHaveBeenCalledWith("apply-for-role.njk", {
				jobRole,
				applicationErrors: {
					applicantEmail: "Enter a valid email address",
				},
				applicantName: "Jane Doe",
				applicantEmail: "not-an-email",
			});
			expect(
				(
					req.session as Request["session"] & {
						applicationErrors?: Record<string, string>;
					}
				).applicationErrors,
			).toBeUndefined();
		});

		it("returns 404 when the job role is not found", async () => {
			vi.mocked(jobRoleApiService.getJobRoleById).mockRejectedValue({
				response: { status: 404 },
			});

			const controller = new ApplicationController();
			const send = vi.fn();
			const status = vi.fn().mockReturnValue({ send });
			const response = { status } as unknown as Response;

			await controller.getApplyForm(
				{ params: { id: "1" } } as unknown as Request,
				response,
			);

			expect(status).toHaveBeenCalledWith(404);
			expect(send).toHaveBeenCalledWith("Job role not found");
		});

		it("redirects to /logout when the backend rejects the session token", async () => {
			vi.mocked(jobRoleApiService.getJobRoleById).mockRejectedValue({
				response: { status: 401 },
			});

			const controller = new ApplicationController();
			const redirect = vi.fn();
			const response = { redirect } as unknown as Response;

			await controller.getApplyForm(
				{ params: { id: "1" }, session: {} } as unknown as Request,
				response,
			);

			expect(redirect).toHaveBeenCalledWith("/logout");
		});
	});
});
