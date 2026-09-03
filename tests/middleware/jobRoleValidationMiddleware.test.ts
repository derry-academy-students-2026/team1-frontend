import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { validateJobRoleId } from "../../src/middleware/jobRoleValidationMiddleware.js";

function buildResponse() {
	const send = vi.fn();
	const status = vi.fn().mockReturnValue({ send });
	return { res: { status } as unknown as Response, status, send };
}

describe("validateJobRoleId", () => {
	it("calls next() for a positive integer id", () => {
		const { res, status } = buildResponse();
		const next = vi.fn() as NextFunction;

		validateJobRoleId({ params: { id: "1" } } as unknown as Request, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(status).not.toHaveBeenCalled();
	});

	it.each(["abc", "0", "-1", "1.5", ""])(
		"returns 404 for the invalid id %j",
		(id) => {
			const { res, status, send } = buildResponse();
			const next = vi.fn() as NextFunction;

			validateJobRoleId(
				{ params: { id } } as unknown as Request,
				res,
				next,
			);

			expect(next).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(404);
			expect(send).toHaveBeenCalledWith("Job role not found");
		},
	);
});
