import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRole } from "../../src/models/jobRole.js";
import * as jobRoleApiService from "../../src/services/jobRoleApiService.js";

describe("JobRoleApiService", () => {
	const mockJobRoles: JobRole[] = [
		{
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: { id: 1, name: "Engineering" },
			band: { id: 2, name: "Band 2" },
			closingDate: new Date("2026-08-30"),
			status: "open",
		},
		{
			id: 2,
			roleName: "Product Manager",
			location: "Dublin",
			capability: { id: 3, name: "Product" },
			band: { id: 3, name: "Band 3" },
			closingDate: new Date("2026-09-05"),
			status: "closed",
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should fetch job roles from the backend API", async () => {
		const getJobRolesSpy = vi
			.spyOn(jobRoleApiService, "getJobRoles")
			.mockResolvedValue(mockJobRoles);

		const result = await jobRoleApiService.getJobRoles();

		expect(getJobRolesSpy).toHaveBeenCalledTimes(1);
		expect(result).toEqual(mockJobRoles);
	});

	it("should handle API errors gracefully", async () => {
		const testError = new Error("Failed to fetch job roles from backend");
		vi.spyOn(jobRoleApiService, "getJobRoles").mockRejectedValue(testError);

		await expect(jobRoleApiService.getJobRoles()).rejects.toThrow(
			"Failed to fetch job roles from backend",
		);
	});

	it("should return job roles with Prisma model structure", async () => {
		vi.spyOn(jobRoleApiService, "getJobRoles").mockResolvedValue(mockJobRoles);

		const result = await jobRoleApiService.getJobRoles();

		expect(result[0]).toMatchObject({
			id: expect.any(Number),
			roleName: expect.any(String),
			location: expect.any(String),
			capability: expect.objectContaining({
				id: expect.any(Number),
				name: expect.any(String),
			}),
			band: expect.objectContaining({
				id: expect.any(Number),
				name: expect.any(String),
			}),
			closingDate: expect.any(Date),
			status: expect.any(String),
		});
	});

	it("should return an empty array when no job roles exist", async () => {
		vi.spyOn(jobRoleApiService, "getJobRoles").mockResolvedValue([]);

		const result = await jobRoleApiService.getJobRoles();

		expect(result).toHaveLength(0);
	});
});
