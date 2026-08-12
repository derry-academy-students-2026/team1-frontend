import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
	getHome,
	JobRoleController,
} from "../../src/controllers/jobRoleController.js";
import type { JobRoleService } from "../../src/services/jobRoleService.js";

const mockService = {
	getOpenJobRoles: vi.fn(),
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
	it("renders job-role-list.html with open roles", () => {
		const openJobRoles = [
			{
				id: 1,
				jobRoleName: "Software Engineer",
				location: "Belfast",
				capability: "Engineering",
				band: "Band 2",
				closingDate: "2026-08-30",
				status: "open" as const,
			},
		];

		mockService.getOpenJobRoles = vi.fn().mockReturnValue(openJobRoles);

		const controller = new JobRoleController(mockService);
		const render = vi.fn();
		const response = { render } as unknown as Response;

		controller.getJobRoles({} as Request, response);

		expect(mockService.getOpenJobRoles).toHaveBeenCalledTimes(1);
		expect(render).toHaveBeenCalledWith("job-role-list.html", {
			jobRoles: openJobRoles,
		});
	});

	it("throws when service getOpenJobRoles fails", () => {
		const testError = new Error("Service failed");
		mockService.getOpenJobRoles = vi.fn(() => {
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
