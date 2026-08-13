import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/jobRoleApiService.js", () => ({
	getJobRoles: vi.fn(),
}));

import app from "../../src/app.js";
import type { JobRole } from "../../src/models/jobRole.js";
import * as jobRoleApiService from "../../src/services/jobRoleApiService.js";

const mockPrismaJobRoles: JobRole[] = [
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
		roleName: "QA Engineer",
		location: "London",
		capability: { id: 2, name: "Quality Assurance" },
		band: { id: 2, name: "Band 2" },
		closingDate: new Date("2026-09-12"),
		status: "open",
	},
];

describe("GET /job-roles", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return 200 OK with job roles from Prisma database", async () => {
		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(
			mockPrismaJobRoles,
		);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Belfast");
	});

	it("should render HTML with formatted dates from Prisma data", async () => {
		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(
			mockPrismaJobRoles,
		);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("30/8/2026");
	});

	it("should handle API errors from Prisma backend", async () => {
		const testError = new Error("Failed to fetch from Prisma database");
		vi.mocked(jobRoleApiService.getJobRoles).mockRejectedValue(testError);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(500);
		expect(response.text).toContain("Unable to load job roles");
	});

	it("should display multiple job roles from Prisma", async () => {
		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(
			mockPrismaJobRoles,
		);

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("QA Engineer");
	});
});

describe("GET /", () => {
	it("should return 200 OK for homepage", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Hello world");
	});
});
