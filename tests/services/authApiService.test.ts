import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient.js";
import logger from "../../src/lib/logger.js";
import { login, register } from "../../src/services/authApiService.js";

vi.mock("../../src/config/apiClient.js");
vi.mock("../../src/lib/logger.js");

describe("authApiService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("login", () => {
		it("should successfully authenticate and return a token and user", async () => {
			vi.mocked(apiClient.post).mockResolvedValue({
				data: {
					token: "signed.jwt.token",
					user: { id: 1, email: "user@kainos.com" },
				},
				status: 200,
				statusText: "OK",
				headers: {},
				config: {} as never,
			});

			const result = await login("user@kainos.com", "Password123!");

			expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
				email: "user@kainos.com",
				password: "Password123!",
			});
			expect(result).toEqual({
				token: "signed.jwt.token",
				user: { id: 1, email: "user@kainos.com" },
			});
		});

		it("should reject and log a warning when credentials are invalid (401)", async () => {
			const axiosError = new axios.AxiosError(
				"Unauthorized",
				"401",
				{} as never,
				{} as never,
				{
					status: 401,
					statusText: "Unauthorized",
					data: {},
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.post).mockRejectedValue(axiosError);

			await expect(login("user@kainos.com", "wrong")).rejects.toThrow();
			expect(logger.warn).toHaveBeenCalledWith(
				"Login rejected: invalid email or password",
			);
		});

		it("should log an error for unexpected failures", async () => {
			const axiosError = new axios.AxiosError(
				"Server Error",
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

			vi.mocked(apiClient.post).mockRejectedValue(axiosError);

			await expect(login("user@kainos.com", "Password123!")).rejects.toThrow();
			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("Unexpected error during login"),
			);
		});

		it("should rethrow non-axios errors without logging", async () => {
			const genericError = new Error("Network down");
			vi.mocked(apiClient.post).mockRejectedValue(genericError);

			await expect(login("user@kainos.com", "Password123!")).rejects.toThrow(
				"Network down",
			);
			expect(logger.warn).not.toHaveBeenCalled();
			expect(logger.error).not.toHaveBeenCalled();
		});
	});

	describe("register", () => {
		it("should successfully register and return a token", async () => {
			vi.mocked(apiClient.post).mockResolvedValue({
				data: { token: "new.jwt.token" },
				status: 201,
				statusText: "Created",
				headers: {},
				config: {} as never,
			});

			const result = await register("newuser@kainos.com", "Password123!");

			expect(apiClient.post).toHaveBeenCalledWith("/auth/register", {
				email: "newuser@kainos.com",
				password: "Password123!",
			});
			expect(result).toEqual({ token: "new.jwt.token" });
		});

		it("should reject and log a warning for a validation error (400)", async () => {
			const axiosError = new axios.AxiosError(
				"Bad Request",
				"400",
				{} as never,
				{} as never,
				{
					status: 400,
					statusText: "Bad Request",
					data: { message: "Enter a valid email address" },
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.post).mockRejectedValue(axiosError);

			await expect(register("bad-email", "Password123!")).rejects.toThrow();
			expect(logger.warn).toHaveBeenCalledWith(
				"Registration rejected: validation error",
			);
		});

		it("should reject and log a warning for an existing account (409)", async () => {
			const axiosError = new axios.AxiosError(
				"Conflict",
				"409",
				{} as never,
				{} as never,
				{
					status: 409,
					statusText: "Conflict",
					data: { message: "An account with this email already exists" },
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.post).mockRejectedValue(axiosError);

			await expect(
				register("duplicate@kainos.com", "Password123!"),
			).rejects.toThrow();
			expect(logger.warn).toHaveBeenCalledWith(
				"Registration rejected: account already exists",
			);
		});

		it("should log an error for unexpected registration failures", async () => {
			const axiosError = new axios.AxiosError(
				"Server Error",
				"500",
				{} as never,
				{} as never,
				{
					status: 500,
					statusText: "Internal Server Error",
					data: { message: "Failed to process registration" },
					headers: {},
					config: {} as never,
				} as never,
			);

			vi.mocked(apiClient.post).mockRejectedValue(axiosError);

			await expect(
				register("user@kainos.com", "Password123!"),
			).rejects.toThrow();
			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining("Unexpected error during registration"),
			);
		});
	});
});
