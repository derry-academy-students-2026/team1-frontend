import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/jobRoleApiService.js", () => ({
	getJobRoles: vi.fn(),
	getJobRoleById: vi.fn(),
}));

vi.mock("../../src/services/authApiService.js", () => ({
	login: vi.fn(),
}));

import app from "../../src/app.js";
import {
	USER_ROLES,
	type UserRole,
} from "../../src/models/authenticatedUser.js";
import type { JobRole } from "../../src/models/jobRole.js";
import * as authApiService from "../../src/services/authApiService.js";
import * as jobRoleApiService from "../../src/services/jobRoleApiService.js";

const TEST_TOKEN = "test-jwt-token";

/** Logs in through the real session flow so requests carry a JWT. */
async function signedInAgent(role: UserRole = USER_ROLES.APPLICANT) {
	const agent = request.agent(app);
	vi.mocked(authApiService.login).mockResolvedValue({
		token: TEST_TOKEN,
		user: { id: 1, email: "test1@example.com", role },
	});
	await agent
		.post("/login")
		.type("form")
		.send({ email: "test1@example.com", password: "Password123!" });
	return agent;
}

const mockPrismaJobRoles: JobRole[] = [
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
	{
		id: 2,
		roleName: "QA Engineer",
		description: "Improve software quality.",
		responsibilities: "Plan and execute tests.",
		sharepointUrl: "https://sharepoint.example.com/qa-engineer",
		location: "London",
		capability: { id: 2, name: "Quality Assurance" },
		band: { id: 2, name: "Band 2" },
		closingDate: new Date("2026-09-12"),
		status: { id: 1, name: "open" },
		numberOfOpenPositions: 1,
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

		const response = await (await signedInAgent()).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Belfast");
		expect(response.text).toContain('href="/job-roles/1"');
	});

	it.each([USER_ROLES.APPLICANT, USER_ROLES.RECRUITMENT_ADMIN] as const)(
		"should allow a %s to view job roles",
		async (role) => {
			vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(
				mockPrismaJobRoles,
			);

			const response = await (await signedInAgent(role)).get("/job-roles");

			expect(response.status).toBe(200);
			expect(response.text).toContain("Current openings");
		},
	);

	it("should redirect to /login when not signed in", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
		expect(jobRoleApiService.getJobRoles).not.toHaveBeenCalled();
	});

	it("should render HTML with formatted dates from Prisma data", async () => {
		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(
			mockPrismaJobRoles,
		);

		const response = await (await signedInAgent()).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("30/8/2026");
	});

	it("should handle API errors from Prisma backend", async () => {
		const testError = new Error("Failed to fetch from Prisma database");
		vi.mocked(jobRoleApiService.getJobRoles).mockRejectedValue(testError);

		const response = await (await signedInAgent()).get("/job-roles");

		expect(response.status).toBe(500);
		expect(response.text).toContain("Unable to load job roles");
	});

	it("should display multiple job roles from Prisma", async () => {
		vi.mocked(jobRoleApiService.getJobRoles).mockResolvedValue(
			mockPrismaJobRoles,
		);

		const response = await (await signedInAgent()).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("QA Engineer");
	});
});

describe("GET /job-roles/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render the job role information page", async () => {
		vi.mocked(jobRoleApiService.getJobRoleById).mockResolvedValue(
			mockPrismaJobRoles[0],
		);

		const response = await (await signedInAgent()).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Build software products.");
		expect(response.text).toContain("View job specification");
		expect(jobRoleApiService.getJobRoleById).toHaveBeenCalledWith(
			1,
			TEST_TOKEN,
		);
	});

	it("should return 404 when the job role does not exist", async () => {
		vi.mocked(jobRoleApiService.getJobRoleById).mockRejectedValue({
			response: { status: 404 },
		});

		const response = await (await signedInAgent()).get("/job-roles/999");

		expect(response.status).toBe(404);
		expect(response.text).toContain("Job role not found");
	});
});

describe("GET /", () => {
	it("should return 200 OK for homepage", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Make a difference with technology");
		expect(response.text).toContain("careers@kainos.com");
	});
});
