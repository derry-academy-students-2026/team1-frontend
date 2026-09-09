import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/applicationApiService.js", () => ({
	applyForJobRole: vi.fn(),
}));

vi.mock("../../src/services/jobRoleApiService.js", () => ({
	getJobRoles: vi.fn(),
	getJobRoleById: vi.fn(),
}));

vi.mock("../../src/services/authApiService.js", () => ({
	login: vi.fn(),
}));

import app from "../../src/app.js";
import type { JobRole } from "../../src/models/jobRole.js";
import * as applicationApiService from "../../src/services/applicationApiService.js";
import * as authApiService from "../../src/services/authApiService.js";
import * as jobRoleApiService from "../../src/services/jobRoleApiService.js";

const TEST_TOKEN = "test-jwt-token";

/** Logs in through the real session flow so requests carry a JWT. */
async function signedInAgent() {
	const agent = request.agent(app);
	vi.mocked(authApiService.login).mockResolvedValue({
		token: TEST_TOKEN,
		user: { id: 1, email: "test1@example.com" },
	});
	await agent
		.post("/login")
		.type("form")
		.send({ email: "test1@example.com", password: "Password123!" });
	return agent;
}

const mockJobRole: JobRole = {
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

const validApplication = {
	applicantName: "Jane Doe",
	applicantEmail: "jane@example.com",
	phoneNumber: "07123456789",
	address: "1 Test Street, Derry",
	coverLetter: "I would like to apply for this role.",
	rightToWork: "yes",
	privacyConsent: "on",
} as const;

const validApplicationResponse = {
	id: 1,
	roleId: 1,
	...validApplication,
	status: "in progress",
	createdAt: new Date("2026-09-03"),
};

describe("GET /job-roles/:id/apply", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the apply form for a signed-in user", async () => {
		vi.mocked(jobRoleApiService.getJobRoleById).mockResolvedValue(mockJobRole);

		const response = await (await signedInAgent()).get("/job-roles/1/apply");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(jobRoleApiService.getJobRoleById).toHaveBeenCalledWith(
			1,
			TEST_TOKEN,
		);
	});

	it("redirects to /login when not signed in", async () => {
		const response = await request(app).get("/job-roles/1/apply");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
		expect(jobRoleApiService.getJobRoleById).not.toHaveBeenCalled();
	});

	it("returns 404 for a non-numeric id without calling the service", async () => {
		const response = await (await signedInAgent()).get("/job-roles/abc/apply");

		expect(response.status).toBe(404);
		expect(jobRoleApiService.getJobRoleById).not.toHaveBeenCalled();
	});
});

describe("POST /job-roles/:id/apply", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("submits the application and redirects with a success flash", async () => {
		vi.mocked(applicationApiService.applyForJobRole).mockResolvedValue(
			validApplicationResponse,
		);

		const response = await (await signedInAgent())
			.post("/job-roles/1/apply")
			.type("form")
			.send(validApplication);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles/1/apply/confirmation");
		expect(applicationApiService.applyForJobRole).toHaveBeenCalledWith(
			1,
			expect.objectContaining({ applicantEmail: "jane@example.com" }),
			TEST_TOKEN,
		);
	});

	it("redirects back to the form when validation fails", async () => {
		const response = await (await signedInAgent())
			.post("/job-roles/1/apply")
			.type("form")
			.send({ ...validApplication, applicantEmail: "not-an-email" });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles/1/apply");
		expect(applicationApiService.applyForJobRole).not.toHaveBeenCalled();
	});

	it("redirects to /login when not signed in", async () => {
		const response = await request(app)
			.post("/job-roles/1/apply")
			.type("form")
			.send(validApplication);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
		expect(applicationApiService.applyForJobRole).not.toHaveBeenCalled();
	});

	it("returns 404 for a non-numeric id without calling the service", async () => {
		const response = await (await signedInAgent())
			.post("/job-roles/abc/apply")
			.type("form")
			.send(validApplication);

		expect(response.status).toBe(404);
		expect(applicationApiService.applyForJobRole).not.toHaveBeenCalled();
	});
});
