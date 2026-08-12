import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/jobRoleApiService.js", () => ({
	getJobRoles: vi.fn(async () => [
		{
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Band 2",
			closingDate: "2026-08-30",
			status: "open",
		},
	]),
}));

import app from "../../src/app.js";

describe("GET /job-roles", () => {
	it("should return 200 OK", async () => {
		const response = await request(app).get("/job-roles");
		expect(response.status).toBe(200);
	});
});

describe("GET /", () => {
	it("should return 200 OK", async () => {
		const _response = await request(app).get("/");
		expect(_response.status).toBe(200);
	});
});
