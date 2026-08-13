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
			{ params: { id: "1" } } as unknown as Request,
			response,
		);

		expect(jobRoleApiService.getJobRoleById).toHaveBeenCalledWith(1);
		expect(render).toHaveBeenCalledWith("job-role-information.njk", {
			jobRole: { ...jobRole, closingDate: "30/8/2026" },
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
});
