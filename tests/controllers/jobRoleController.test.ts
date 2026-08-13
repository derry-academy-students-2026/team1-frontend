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

	it("renders job-role-list.html with roles from Prisma API", async () => {
		const jobRoles = [
			{
				id: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				capability: { id: 1, name: "Engineering" },
				band: { id: 2, name: "Band 2" },
				closingDate: new Date("2026-08-30"),
				status: "open",
			},
		];

		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(jobRoles);

		const controller = new JobRoleController();
		const render = vi.fn();
		const response = { render } as unknown as Response;

		await controller.getJobRoles({} as Request, response);

		expect(jobRoleApiService.getJobRoles).toHaveBeenCalledTimes(1);
		expect(render).toHaveBeenCalledWith("job-role-list.html", {
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
				location: "London",
				capability: { id: 4, name: "Testing" },
				band: { id: 1, name: "Band 1" },
				closingDate: new Date("2026-12-25"),
				status: "open",
			},
		];

		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(jobRoles);

		const controller = new JobRoleController();
		const render = vi.fn();
		const response = { render } as unknown as Response;

		await controller.getJobRoles({} as Request, response);

		const callArgs = render.mock.calls[0];
		expect(callArgs[0]).toBe("job-role-list.html");
		expect(callArgs[1].jobRoles[0].closingDate).toBe("25/12/2026");
	});

	it("converts string date to Date object when closingDate is not a Date instance", async () => {
		// Tests the branch: new Date(jobRole.closingDate) when closingDate is a string
		const jobRoles = [
			{
				id: 2,
				roleName: "API String Date Test",
				location: "Dublin",
				capability: { id: 5, name: "DevOps" },
				band: { id: 3, name: "Band 3" },
				closingDate: "2026-10-15" as unknown as Date, // Simulate API returning string
				status: "open",
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
});
