import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient.js";
import logger from "../../src/lib/logger.js";
import { applyForJobRole } from "../../src/services/applicationApiService.js";

vi.mock("../../src/config/apiClient.js");
vi.mock("../../src/lib/logger.js");

describe("ApplicationApiService", () => {
	const applicationRequest = {
		applicantName: "Jane Doe",
		applicantEmail: "jane@example.com",
		phoneNumber: "07123456789",
		address: "1 Test Street, Derry",
		coverLetter: "I would like to apply for this role.",
		rightToWork: "yes",
		privacyConsent: "on",
	} as const;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should submit an application and return the created record", async () => {
		const application = {
			id: 1,
			roleId: 1,
			...applicationRequest,
			status: "in progress",
			createdAt: new Date("2026-09-03"),
		};
		vi.mocked(apiClient.post).mockResolvedValue({
			data: application,
			status: 201,
			statusText: "Created",
			headers: {},
			config: {} as never,
		});

		const result = await applyForJobRole(1, applicationRequest, "test-token");

		expect(apiClient.post).toHaveBeenCalledWith(
			"/job-roles/1/apply",
			applicationRequest,
			{ headers: { Authorization: "Bearer test-token" } },
		);
		expect(result).toEqual(application);
	});

	it("should log and rethrow on a duplicate application (409)", async () => {
		const axiosError = new axios.AxiosError(
			"Conflict",
			"409",
			{} as never,
			{} as never,
			{
				status: 409,
				statusText: "Conflict",
				data: {},
				headers: {},
				config: {} as never,
			} as never,
		);
		vi.mocked(apiClient.post).mockRejectedValue(axiosError);

		await expect(applyForJobRole(1, applicationRequest)).rejects.toThrow();
		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("Duplicate application"),
		);
	});

	it("should log and rethrow on invalid application data (400)", async () => {
		const axiosError = new axios.AxiosError(
			"Bad Request",
			"400",
			{} as never,
			{} as never,
			{
				status: 400,
				statusText: "Bad Request",
				data: {},
				headers: {},
				config: {} as never,
			} as never,
		);
		vi.mocked(apiClient.post).mockRejectedValue(axiosError);

		await expect(applyForJobRole(1, applicationRequest)).rejects.toThrow();
		expect(logger.error).toHaveBeenCalledWith(
			expect.stringContaining("Invalid application data"),
		);
	});

	it("should rethrow non-axios errors", async () => {
		const error = new Error("Network down");
		vi.mocked(apiClient.post).mockRejectedValue(error);

		await expect(applyForJobRole(1, applicationRequest)).rejects.toThrow(
			"Network down",
		);
	});
});
