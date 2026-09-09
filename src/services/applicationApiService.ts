import axios from "axios";
import apiClient from "../config/apiClient.js";
import { authConfig } from "../lib/authConfig.js";
import logger from "../lib/logger.js";
import type { Application, ApplicationRequest } from "../models/application.js";

export async function applyForJobRole(
	roleId: number,
	data: ApplicationRequest,
	token?: string,
): Promise<Application> {
	try {
		const response = await apiClient.post<Application>(
			`/job-roles/${roleId}/apply`,
			data,
			authConfig(token),
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 409) {
				logger.error(`Duplicate application for job role ${roleId} (409)`);
			} else if (status === 400) {
				logger.error(`Invalid application data for job role ${roleId} (400)`);
			} else if (status === 404) {
				logger.error(`Job role ${roleId} not found (404)`);
			} else if (status === 500) {
				logger.error(
					`Server error while applying for job role ${roleId} (500)`,
				);
			} else {
				logger.error(`Unexpected error: ${error.message}`);
			}
			throw error;
		}
		throw error;
	}
}
