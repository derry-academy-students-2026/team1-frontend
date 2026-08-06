import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { getHome } from "../src/controllers/jobController.js";

describe("getHome", () => {
	it("sends the homepage markup", () => {
		const send = vi.fn();
		const response = { send } as unknown as Response;

		getHome({} as never, response);

		expect(send).toHaveBeenCalledWith(
			"<!doctype html><html><body><h1>Hello world</h1></body></html>",
		);
	});
});
