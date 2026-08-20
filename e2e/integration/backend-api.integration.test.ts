import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import apiClient from "../../src/config/apiClient.js";
import { login } from "../../src/services/authApiService.js";
import {
	getJobRoleById,
	getJobRoles,
} from "../../src/services/jobRoleApiService.js";

const mockToken = "mock-backend-token";
const mockJobRoles = [
	{
		id: 1,
		roleName: "Software Engineer",
		description: "Build and maintain product features.",
		responsibilities: "Design, code, review, and deploy.",
		sharepointUrl: "https://example.test/software-engineer",
		location: "Derry",
		capability: { id: 1, name: "Engineering" },
		band: { id: 2, name: "Band 2" },
		closingDate: "2026-08-11T00:00:00.000Z",
		status: { id: 1, name: "open" },
		numberOfOpenPositions: 1,
	},
];

let mockBackend: Server;
let mockBackendUrl: string;
let receivedAuthorization: string | undefined;
let originalBaseUrl: string | undefined;

function sendJson(
	response: import("node:http").ServerResponse,
	status: number,
	body: unknown,
) {
	response.writeHead(status, { "Content-Type": "application/json" });
	response.end(JSON.stringify(body));
}

describe("frontend API services with a mock backend", () => {
	beforeAll(async () => {
		mockBackend = createServer((request, response) => {
			if (request.method === "POST" && request.url === "/auth/login") {
				let requestBody = "";
				request.on("data", (chunk: Buffer) => {
					requestBody += chunk.toString();
				});
				request.on("end", () => {
					const credentials = JSON.parse(requestBody) as {
						email?: string;
						password?: string;
					};

					if (
						credentials.email === "test1@example.com" &&
						credentials.password === "Password123!"
					) {
						sendJson(response, 200, {
							token: mockToken,
							user: { id: 1, email: credentials.email },
						});
						return;
					}

					sendJson(response, 401, { message: "Invalid credentials" });
				});
				return;
			}

			if (request.method === "GET" && request.url === "/job-roles") {
				receivedAuthorization = request.headers.authorization;
				if (receivedAuthorization !== `Bearer ${mockToken}`) {
					sendJson(response, 401, { message: "Invalid token" });
					return;
				}

				sendJson(response, 200, mockJobRoles);
				return;
			}

			if (request.method === "GET" && request.url === "/job-roles/1") {
				receivedAuthorization = request.headers.authorization;
				if (receivedAuthorization !== `Bearer ${mockToken}`) {
					sendJson(response, 401, { message: "Invalid token" });
					return;
				}

				sendJson(response, 200, mockJobRoles[0]);
				return;
			}

			sendJson(response, 404, { message: "Not found" });
		});

		await new Promise<void>((resolve) => {
			mockBackend.listen(0, "127.0.0.1", resolve);
		});

		const address = mockBackend.address();
		if (!address || typeof address === "string") {
			throw new Error("Mock backend did not expose a TCP port");
		}

		mockBackendUrl = `http://127.0.0.1:${address.port}`;
		originalBaseUrl = apiClient.defaults.baseURL;
	});

	beforeEach(() => {
		apiClient.defaults.baseURL = mockBackendUrl;
		receivedAuthorization = undefined;
	});

	afterAll(async () => {
		apiClient.defaults.baseURL = originalBaseUrl;
		await new Promise<void>((resolve, reject) => {
			mockBackend.close((error) => (error ? reject(error) : resolve()));
		});
	});

	it("authenticates and retrieves protected job roles through HTTP", async () => {
		const authenticatedUser = await login("test1@example.com", "Password123!");
		const jobRoles = await getJobRoles(authenticatedUser.token);

		expect(authenticatedUser).toEqual({
			token: mockToken,
			user: { id: 1, email: "test1@example.com" },
		});
		expect(receivedAuthorization).toBe(`Bearer ${mockToken}`);
		expect(jobRoles).toEqual(mockJobRoles);
	});

	it("retrieves job role 1 through HTTP with an authenticated token", async () => {
		const jobRole = await getJobRoleById(1, mockToken);

		expect(receivedAuthorization).toBe(`Bearer ${mockToken}`);
		expect(jobRole).toEqual(mockJobRoles[0]);
	});

	it("reports an error when it requests a job role without a token", async () => {
		await expect(getJobRoleById(1)).rejects.toMatchObject({
			response: { status: 401, data: { message: "Invalid token" } },
		});
	});

	it("reports an error when the requested job role does not exist", async () => {
		await expect(getJobRoleById(43, mockToken)).rejects.toMatchObject({
			response: { status: 404, data: { message: "Not found" } },
		});
	});

	it("reports an error when it requests job roles without a token", async () => {
		await expect(getJobRoles()).rejects.toMatchObject({
			response: { status: 401, data: { message: "Invalid token" } },
		});
	});
});
