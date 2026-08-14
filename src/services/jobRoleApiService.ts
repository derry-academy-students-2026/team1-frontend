import axios from "axios";
import apiClient from "../config/apiClient.js";
import logger from "../lib/logger.js";
import type { JobRole } from "../models/jobRole.js";

/**
 * Builds the request config carrying the caller's bearer token, if any.
 */
function authConfig(token?: string) {
	return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

/**
 * Fetches all job roles from the backend Prisma API.
 * Handles various error scenarios with appropriate logging and re-throws for caller handling.
 * @param token - JWT issued by the backend, forwarded as a bearer token.
 * @returns Promise resolving to array of JobRole objects from Prisma database.
 * @throws {AxiosError} If API request fails (401, 404, 500, or network error).
 */
export async function getJobRoles(token?: string): Promise<JobRole[]> {
	try {
		const response = await apiClient.get<JobRole[]>(
			"/job-roles",
			authConfig(token),
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 404) {
				logger.error("Job roles not found (404)");
			} else if (status === 500) {
				logger.error("Server error while fetching job roles (500)");
			} else {
				logger.error(`Unexpected error: ${error.message}`);
			}
			throw error; // Rethrow the error for further handling if needed
		}
		throw error; // Rethrow the error if it's not an AxiosError
	}
}

// Fetch a single job role by ID from the API
export async function getJobRoleById(
	id: number,
	token?: string,
): Promise<JobRole> {
	try {
		const response = await apiClient.get<JobRole>(
			`/job-roles/${id}`,
			authConfig(token),
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 404) {
				logger.error(`Job role ${id} not found (404)`);
			} else if (status === 500) {
				logger.error(`Server error while fetching job role ${id} (500)`);
			} else {
				logger.error(`Unexpected error: ${error.message}`);
			}
			throw error;
		}
		throw error;
	}
}
