import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { requireFeature } from "../../src/middleware/featureFlagMiddleware.js";

const createRequest = () => ({ path: "/register" }) as Request;
const createResponse = () =>
	({ sendStatus: vi.fn() }) as unknown as Response & {
		sendStatus: ReturnType<typeof vi.fn>;
	};

describe("requireFeature", () => {
	it("passes the request on when the feature is enabled", () => {
		const res = createResponse();
		const next = vi.fn() as unknown as NextFunction;

		requireFeature("registration", () => true)(createRequest(), res, next);

		expect(next).toHaveBeenCalledOnce();
		expect(res.sendStatus).not.toHaveBeenCalled();
	});

	it("responds 404 and stops the chain when the feature is disabled", () => {
		const res = createResponse();
		const next = vi.fn() as unknown as NextFunction;

		requireFeature("registration", () => false)(createRequest(), res, next);

		expect(res.sendStatus).toHaveBeenCalledWith(404);
		expect(next).not.toHaveBeenCalled();
	});

	it("re-evaluates the flag on every request", () => {
		let enabled = true;
		const middleware = requireFeature("registration", () => enabled);
		const next = vi.fn() as unknown as NextFunction;

		middleware(createRequest(), createResponse(), next);
		expect(next).toHaveBeenCalledOnce();

		enabled = false;
		const res = createResponse();
		middleware(createRequest(), res, next);

		expect(res.sendStatus).toHaveBeenCalledWith(404);
		expect(next).toHaveBeenCalledOnce();
	});
});
