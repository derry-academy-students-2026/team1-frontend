import { beforeEach, describe, expect, it } from "vitest";
import { JobRoleService } from "../../src/services/jobRoleService.js";

interface TestJobRole {
	id: number;
	roleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: Date;
	status: string;
}

describe("JobRoleService", () => {
	let service: JobRoleService;

	beforeEach(() => {
		service = new JobRoleService();
	});

	it("should return all job roles", () => {
		const jobRoles = service.getJobRoles();
		expect(jobRoles.length).toBeGreaterThan(0);
	});

	it("should include both open and closed roles when present", () => {
		const jobRoles = service.getJobRoles();
		const hasOpenRole = jobRoles.some((jobRole) => jobRole.status === "open");
		const hasClosedRole = jobRoles.some((jobRole) => jobRole.status === "closed");

		expect(hasOpenRole).toBe(true);
		expect(hasClosedRole).toBe(true);
	});

	it("should return job roles with the expected fields", () => {
		const jobRoles = service.getJobRoles();

		expect(jobRoles[0]).toMatchObject({
			id: expect.any(Number),
			roleName: expect.any(String),
			location: expect.any(String),
			capability: expect.any(String),
			band: expect.any(String),
			closingDate: expect.any(Date),
			status: expect.any(String),
		});
	});

	it("should return an empty array if there are no job roles", () => {
		(service as unknown as { jobRoles: TestJobRole[] }).jobRoles = [];

		const jobRoles = service.getJobRoles();
		expect(jobRoles).toHaveLength(0);
	});
});
