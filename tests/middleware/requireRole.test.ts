import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { requireRole } from "../../src/middleware/requireRole.js";
import { USER_ROLES } from "../../src/models/authenticatedUser.js";

const createResponse = () => {
	const response = {
		status: vi.fn(),
		send: vi.fn(),
	};
	response.status.mockReturnValue(response);
	return response;
};

describe("requireRole", () => {
	it("continues when the session user has an allowed role", () => {
		const next = vi.fn();
		const response = createResponse();
		const request = {
			originalUrl: "/job-roles/new",
			session: {
				user: {
					id: 1,
					email: "admin@example.com",
					role: USER_ROLES.RECRUITMENT_ADMIN,
				},
			},
		} as unknown as Request;

		requireRole(USER_ROLES.RECRUITMENT_ADMIN)(
			request,
			response as unknown as Response,
			next,
		);

		expect(next).toHaveBeenCalledOnce();
		expect(response.status).not.toHaveBeenCalled();
	});

	it("returns 403 when the session user has a different role", () => {
		const next = vi.fn();
		const response = createResponse();
		const request = {
			originalUrl: "/job-roles/new",
			session: {
				user: {
					id: 2,
					email: "applicant@example.com",
					role: USER_ROLES.APPLICANT,
				},
			},
		} as unknown as Request;

		requireRole(USER_ROLES.RECRUITMENT_ADMIN)(
			request,
			response as unknown as Response,
			next,
		);

		expect(response.status).toHaveBeenCalledWith(403);
		expect(response.send).toHaveBeenCalledWith("Forbidden");
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 403 when no session user role is available", () => {
		const next = vi.fn();
		const response = createResponse();
		const request = {
			originalUrl: "/job-roles/new",
			session: {},
		} as unknown as Request;

		requireRole(USER_ROLES.RECRUITMENT_ADMIN)(
			request,
			response as unknown as Response,
			next,
		);

		expect(response.status).toHaveBeenCalledWith(403);
		expect(next).not.toHaveBeenCalled();
	});
});
