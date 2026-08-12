import axios from "axios";
import apiClient from "../config/apiClient.js";
import logger from "../lib/logger.js";
import type { JobRole } from "../models/jobRole.js";

/**
 * Fetches all job roles from the backend Prisma API.
 * Handles various error scenarios with appropriate logging and re-throws for caller handling.
 * @returns Promise resolving to array of JobRole objects from Prisma database.
 * @throws {AxiosError} If API request fails (404, 500, or network error).
 */
export async function getJobRoles(): Promise<JobRole[]> {
	try {
		const response = await apiClient.get<JobRole[]>("/job-roles");
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
