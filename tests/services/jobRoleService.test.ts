import { beforeEach, describe, expect, it } from "vitest";
import type { JobRole } from "../../src/services/jobRoleService.js";
import { JobRoleService } from "../../src/services/jobRoleService.js";

describe("JobRoleService", () => {
	let service: JobRoleService;

	beforeEach(() => {
		service = new JobRoleService();
	});

	it("should return only open job roles", () => {
		const openJobRoles = service.getOpenJobRoles();
		expect(openJobRoles.length).toBeGreaterThan(0);
		expect(openJobRoles.every((jobRole) => jobRole.status === "open")).toBe(
			true,
		);
	});

	it("should exclude closed job roles", () => {
		const openJobRoles = service.getOpenJobRoles();
		const hasClosedRole = openJobRoles.some(
			(jobRole) => jobRole.status === "closed",
		);

		expect(hasClosedRole).toBe(false);
	});

	it("should return job roles with the expected fields", () => {
		const openJobRoles = service.getOpenJobRoles();

		expect(openJobRoles[0]).toMatchObject({
			id: expect.any(Number),
			jobRoleName: expect.any(String),
			location: expect.any(String),
			capability: expect.any(String),
			band: expect.any(String),
			closingDate: expect.any(String),
			status: "open",
		});
	});

	it("should return an empty array if there are no open job roles", () => {
		const closedRolesOnly: JobRole[] = [
			{
				id: 10,
				jobRoleName: "Business Analyst",
				location: "Belfast",
				capability: "Consulting",
				band: "Band 2",
				closingDate: "2026-10-01",
				status: "closed",
			},
		];

		(service as unknown as { jobRoles: JobRole[] }).jobRoles = closedRolesOnly;

		const openJobRoles = service.getOpenJobRoles();
		expect(openJobRoles).toHaveLength(0);
	});
});
