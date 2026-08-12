import request from "supertest";
import { describe, expect, it } from "vitest";
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
