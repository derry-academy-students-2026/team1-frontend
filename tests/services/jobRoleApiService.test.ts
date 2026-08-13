import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient.js";
import logger from "../../src/lib/logger.js";
import type { JobRole } from "../../src/models/jobRole.js";
import {
	getJobRoleById,
	getJobRoles,
} from "../../src/services/jobRoleApiService.js";

vi.mock("../../src/config/apiClient.js");
vi.mock("../../src/lib/logger.js");

describe("JobRoleApiService", () => {
	const mockJobRoles: JobRole[] = [
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
			roleName: "Product Manager",
			description: "Lead product delivery.",
			responsibilities: "Plan and deliver product improvements.",
			sharepointUrl: "https://sharepoint.example.com/product-manager",
			location: "Dublin",
			capability: { id: 3, name: "Product" },
			band: { id: 3, name: "Band 3" },
			closingDate: new Date("2026-09-05"),
			status: { id: 2, name: "closed" },
			numberOfOpenPositions: 1,
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getJobRoles", () => {
		it("should successfully fetch job roles from the backend API", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: mockJobRoles,
				status: 200,
				statusText: "OK",
				headers: {},
				config: {} as never,
			});

			const result = await getJobRoles();

			expect(apiClient.get).toHaveBeenCalledWith("/job-roles");
			expect(result).toEqual(mockJobRoles);
			expect(result).toHaveLength(2);
		});

		it("should return an empty array when no job roles are available", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: [],
				status: 200,
				statusText: "OK",
				headers: {},
				config: {} as never,
			});

			const result = await getJobRoles();

			expect(result).toHaveLength(0);
			expect(result).toEqual([]);
		});

		it("should handle 404 errors and log appropriately", async () => {
			const axiosError = new axios.AxiosError(
				"Not Found",
				"404",
				{} as never,
				{} as never,
				{
					status: 404,
					statusText: "Not Found",
					data: {},
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.get).mockRejectedValue(axiosError);

			await expect(getJobRoles()).rejects.toThrow();
			expect(logger.error).toHaveBeenCalledWith("Job roles not found (404)");
		});

		it("should handle 500 errors and log appropriately", async () => {
			const axiosError = new axios.AxiosError(
				"Internal Server Error",
				"500",
				{} as never,
				{} as never,
				{
					status: 500,
					statusText: "Internal Server Error",
					data: {},
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.get).mockRejectedValue(axiosError);

			await expect(getJobRoles()).rejects.toThrow();
			expect(logger.error).toHaveBeenCalledWith(
				"Server error while fetching job roles (500)",
			);
		});

		it("should handle unexpected axios errors", async () => {
			const axiosError = new axios.AxiosError(
				"Network Error",
				"ECONNREFUSED",
				{} as never,
				{} as never,
				{
					status: undefined,
					statusText: "",
					data: {},
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.get).mockRejectedValue(axiosError);

			await expect(getJobRoles()).rejects.toThrow("Network Error");
			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("Unexpected error"),
			);
		});

		it("should handle non-axios errors", async () => {
			const genericError = new Error("Unexpected error");
			vi.mocked(apiClient.get).mockRejectedValue(genericError);

			await expect(getJobRoles()).rejects.toThrow("Unexpected error");
		});

		it("should return job roles with correct data structure", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: mockJobRoles,
				status: 200,
				statusText: "OK",
				headers: {},
				config: {} as never,
			});

			const result = await getJobRoles();

			expect(result[0]).toMatchObject({
				id: expect.any(Number),
				roleName: expect.any(String),
				location: expect.any(String),
				capability: expect.objectContaining({
					id: expect.any(Number),
					name: expect.any(String),
				}),
				band: expect.objectContaining({
					id: expect.any(Number),
					name: expect.any(String),
				}),
				closingDate: expect.any(Date),
				status: expect.objectContaining({
					id: expect.any(Number),
					name: expect.any(String),
				}),
			});
		});

		it("should call apiClient.get exactly once", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: mockJobRoles,
				status: 200,
				statusText: "OK",
				headers: {},
				config: {} as never,
			});

			await getJobRoles();

			expect(apiClient.get).toHaveBeenCalledTimes(1);
		});

		it("should throw error on failed API call", async () => {
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

			vi.mocked(apiClient.get).mockRejectedValue(axiosError);

			await expect(getJobRoles()).rejects.toThrow();
		});

		it("should handle 403 Forbidden errors", async () => {
			const axiosError = new axios.AxiosError(
				"Forbidden",
				"403",
				{} as never,
				{} as never,
				{
					status: 403,
					statusText: "Forbidden",
					data: {},
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.get).mockRejectedValue(axiosError);

			await expect(getJobRoles()).rejects.toThrow();
			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("Unexpected error"),
			);
		});

		it("should handle timeout and network errors", async () => {
			const timeoutError = new axios.AxiosError(
				"timeout of 5000ms exceeded",
				"ECONNABORTED",
				{} as never,
				{} as never,
				{
					status: undefined,
					statusText: "",
					data: {},
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.get).mockRejectedValue(timeoutError);

			await expect(getJobRoles()).rejects.toThrow("timeout of 5000ms exceeded");
			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("Unexpected error"),
			);
		});
	});

	describe("getJobRoleById", () => {
		it("should fetch one job role from the backend API", async () => {
			vi.mocked(apiClient.get).mockResolvedValue({
				data: mockJobRoles[0],
				status: 200,
				statusText: "OK",
				headers: {},
				config: {} as never,
			});

			const result = await getJobRoleById(1);

			expect(apiClient.get).toHaveBeenCalledWith("/job-roles/1");
			expect(result).toEqual(mockJobRoles[0]);
		});

		it("should rethrow errors when fetching one job role fails", async () => {
			const error = new Error("Failed to fetch job role");
			vi.mocked(apiClient.get).mockRejectedValue(error);

			await expect(getJobRoleById(1)).rejects.toThrow(
				"Failed to fetch job role",
			);
		});
	});
});
