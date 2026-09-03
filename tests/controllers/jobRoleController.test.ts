import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getHome,
	JobRoleController,
} from "../../src/controllers/jobRoleController.js";
import * as jobRoleApiService from "../../src/services/jobRoleApiService.js";

vi.mock("../../src/services/jobRoleApiService.js");

describe("getHome", () => {
	it("renders the homepage view", () => {
		const render = vi.fn();
		const response = { render } as unknown as Response;

		getHome({} as never, response);

		expect(render).toHaveBeenCalledWith("index.html");
	});
});

describe("JobRoleController", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders job-role-list.njk with roles from Prisma API", async () => {
		const jobRoles = [
			{
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
			},
		];

		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(jobRoles);

		const controller = new JobRoleController();
		const render = vi.fn();
		const response = { render } as unknown as Response;

		await controller.getJobRoles({} as Request, response);

		expect(jobRoleApiService.getJobRoles).toHaveBeenCalledTimes(1);
		expect(render).toHaveBeenCalledWith("job-role-list.njk", {
			jobRoles: [
				{
					...jobRoles[0],
					closingDate: "30/8/2026",
				},
			],
		});
	});

	it("handles date conversion from Prisma API string format", async () => {
		const jobRoles = [
			{
				id: 1,
				roleName: "Test Role",
				description: "Test description.",
				responsibilities: "Test responsibilities.",
				sharepointUrl: "https://sharepoint.example.com/test-role",
				location: "London",
				capability: { id: 4, name: "Testing" },
				band: { id: 1, name: "Band 1" },
				closingDate: new Date("2026-12-25"),
				status: { id: 1, name: "open" },
				numberOfOpenPositions: 1,
			},
		];

		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(jobRoles);

		const controller = new JobRoleController();
		const render = vi.fn();
		const response = { render } as unknown as Response;

		await controller.getJobRoles({} as Request, response);

		const callArgs = render.mock.calls[0];
		expect(callArgs[0]).toBe("job-role-list.njk");
		expect(callArgs[1].jobRoles[0].closingDate).toBe("25/12/2026");
	});

	it("converts string date to Date object when closingDate is not a Date instance", async () => {
		// Tests the branch: new Date(jobRole.closingDate) when closingDate is a string
		const jobRoles = [
			{
				id: 2,
				roleName: "API String Date Test",
				description: "Test description.",
				responsibilities: "Test responsibilities.",
				sharepointUrl: "https://sharepoint.example.com/api-string-date",
				location: "Dublin",
				capability: { id: 5, name: "DevOps" },
				band: { id: 3, name: "Band 3" },
				closingDate: "2026-10-15" as unknown as Date, // Simulate API returning string
				status: { id: 1, name: "open" },
				numberOfOpenPositions: 1,
			},
		];

		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(jobRoles);

		const controller = new JobRoleController();
		const render = vi.fn();
		const response = { render } as unknown as Response;

		await controller.getJobRoles({} as Request, response);

		const callArgs = render.mock.calls[0];
		expect(callArgs[1].jobRoles[0].closingDate).toBe("15/10/2026");
	});

	it("returns 500 when API fails", async () => {
		const testError = new Error("Backend API failed");
		vi.mocked(jobRoleApiService.getJobRoles).mockRejectedValue(testError);

		const controller = new JobRoleController();
		const render = vi.fn();
		const send = vi.fn();
		const status = vi.fn().mockReturnValue({ send });
		const response = { render, status } as unknown as Response;

		await controller.getJobRoles({} as Request, response);

		expect(status).toHaveBeenCalledWith(500);
		expect(send).toHaveBeenCalledWith("Unable to load job roles");
		expect(render).not.toHaveBeenCalled();
	});

	it("renders job-role-information.njk with a job role", async () => {
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
		vi.mocked(jobRoleApiService.getJobRoleById).mockResolvedValue(jobRole);

		const controller = new JobRoleController();
		const render = vi.fn();
		const response = { render } as unknown as Response;

		await controller.getJobRole(
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
		expect(render).toHaveBeenCalledWith("job-role-information.njk", {
			jobRole: { ...jobRole, closingDate: "30/8/2026" },
			applySuccess: false,
		});
	});

	it("returns 404 when the job role is not found", async () => {
		vi.mocked(jobRoleApiService.getJobRoleById).mockRejectedValue({
			response: { status: 404 },
		});

		const controller = new JobRoleController();
		const send = vi.fn();
		const status = vi.fn().mockReturnValue({ send });
		const response = { status } as unknown as Response;

		await controller.getJobRole(
			{ params: { id: "1" } } as unknown as Request,
			response,
		);

		expect(status).toHaveBeenCalledWith(404);
		expect(send).toHaveBeenCalledWith("Job role not found");
	});

	describe("applyForRole", () => {
		it("submits the application and redirects with a success flash", async () => {
			vi.mocked(jobRoleApiService.applyForJobRole).mockResolvedValue({
				id: 1,
				roleId: 1,
				applicantName: "Jane Doe",
				applicantEmail: "jane@example.com",
				status: "in progress",
				createdAt: new Date("2026-09-03"),
			});

			const controller = new JobRoleController();
			const redirect = vi.fn();
			const response = { redirect } as unknown as Response;

			await controller.applyForRole(
				{
					params: { id: "1" },
					body: {
						applicantName: "Jane Doe",
						applicantEmail: "jane@example.com",
					},
					session: { jwtToken: "test-token" },
				} as unknown as Request,
				response,
			);

			expect(jobRoleApiService.applyForJobRole).toHaveBeenCalledWith(
				1,
				{
					applicantName: "Jane Doe",
					applicantEmail: "jane@example.com",
					phoneNumber: undefined,
					address: undefined,
					linkedInUrl: undefined,
					coverLetter: undefined,
				},
				"test-token",
			);
			expect(redirect).toHaveBeenCalledWith("/job-roles/1?applySuccess=1");
		});

		it("returns 404 for a non-numeric id", async () => {
			const controller = new JobRoleController();
			const send = vi.fn();
			const status = vi.fn().mockReturnValue({ send });
			const response = { status } as unknown as Response;

			await controller.applyForRole(
				{ params: { id: "abc" }, body: {} } as unknown as Request,
				response,
			);

			expect(status).toHaveBeenCalledWith(404);
			expect(jobRoleApiService.applyForJobRole).not.toHaveBeenCalled();
		});

		it("redirects to /logout when the backend rejects the session token", async () => {
			vi.mocked(jobRoleApiService.applyForJobRole).mockRejectedValue({
				response: { status: 401 },
			});

			const controller = new JobRoleController();
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
			vi.mocked(jobRoleApiService.applyForJobRole).mockRejectedValue({
				response: { status: 409 },
			});

			const controller = new JobRoleController();
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

			expect(redirect).toHaveBeenCalledWith(
				expect.stringContaining(
					"/job-roles/1/apply?applyError=You+have+already+applied+for+this+role",
				),
			);
		});

		it("redirects back with a generic error flash on unexpected failures", async () => {
			vi.mocked(jobRoleApiService.applyForJobRole).mockRejectedValue(
				new Error("Network error"),
			);

			const controller = new JobRoleController();
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

			expect(redirect).toHaveBeenCalledWith(
				expect.stringContaining("/job-roles/1/apply?applyError="),
			);
		});
	});

	describe("getApplyForm", () => {
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

		it("renders apply-for-role.njk with the job role and empty flash state", async () => {
			vi.mocked(jobRoleApiService.getJobRoleById).mockResolvedValue(jobRole);

			const controller = new JobRoleController();
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
				applyError: undefined,
				applicantName: "",
				applicantEmail: "",
				phoneNumber: "",
				address: "",
				linkedInUrl: "",
				coverLetter: "",
			});
		});

		it("passes through the applyError flash and preserved input", async () => {
			vi.mocked(jobRoleApiService.getJobRoleById).mockResolvedValue(jobRole);

			const controller = new JobRoleController();
			const render = vi.fn();
			const response = { render } as unknown as Response;

			await controller.getApplyForm(
				{
					params: { id: "1" },
					query: {
						applyError: "Enter a valid email address",
						applicantName: "Jane Doe",
						applicantEmail: "not-an-email",
					},
				} as unknown as Request,
				response,
			);

			expect(render).toHaveBeenCalledWith("apply-for-role.njk", {
				jobRole,
				applyError: "Enter a valid email address",
				applicantName: "Jane Doe",
				applicantEmail: "not-an-email",
				phoneNumber: "",
				address: "",
				linkedInUrl: "",
				coverLetter: "",
			});
		});

		it("returns 404 for a non-numeric id", async () => {
			const controller = new JobRoleController();
			const send = vi.fn();
			const status = vi.fn().mockReturnValue({ send });
			const response = { status } as unknown as Response;

			await controller.getApplyForm(
				{ params: { id: "abc" } } as unknown as Request,
				response,
			);

			expect(status).toHaveBeenCalledWith(404);
			expect(send).toHaveBeenCalledWith("Job role not found");
		});

		it("returns 404 when the job role is not found", async () => {
			vi.mocked(jobRoleApiService.getJobRoleById).mockRejectedValue({
				response: { status: 404 },
			});

			const controller = new JobRoleController();
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

			const controller = new JobRoleController();
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
