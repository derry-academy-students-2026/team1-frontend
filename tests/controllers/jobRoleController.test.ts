import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
	getHome,
	JobRoleController,
} from "../../src/controllers/jobRoleController.js";
import type { JobRoleService } from "../../src/services/jobRoleService.js";

const mockService = {
	getJobRoles: vi.fn(),
} as unknown as JobRoleService;

describe("getHome", () => {
	it("sends the homepage markup", () => {
		const send = vi.fn();
		const response = { send } as unknown as Response;

		getHome({} as never, response);

		expect(send).toHaveBeenCalledWith(
			"<!doctype html><html><body><h1>Hello world</h1></body></html>",
		);
	});
});

describe("JobRoleController", () => {
	it("renders job-role-list.html with roles", () => {
		const jobRoles = [
			{
				id: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				capability: "Engineering",
				band: "Band 2",
				closingDate: new Date("2026-08-30"),
				status: "open",
			},
		];

		mockService.getJobRoles = vi.fn().mockReturnValue(jobRoles);

		const controller = new JobRoleController(mockService);
		const render = vi.fn();
		const response = { render } as unknown as Response;

		controller.getJobRoles({} as Request, response);

		expect(mockService.getJobRoles).toHaveBeenCalledTimes(1);
		expect(render).toHaveBeenCalledWith("job-role-list.html", {
			jobRoles: [
				{
					...jobRoles[0],
					closingDate: "30/8/2026",
				},
			],
		});
	});

	it("throws when service getJobRoles fails", () => {
		const testError = new Error("Service failed");
		mockService.getJobRoles = vi.fn(() => {
			throw testError;
		});

		const controller = new JobRoleController(mockService);
		const render = vi.fn();
		const response = { render } as unknown as Response;

		expect(() => controller.getJobRoles({} as Request, response)).toThrow(
			"Service failed",
		);
		expect(render).not.toHaveBeenCalled();
	});
});
