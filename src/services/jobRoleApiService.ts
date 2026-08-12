import apiClient from "../config/apiClient.js";
import logger from "../lib/logger.js";
import type { JobRole } from "../models/jobRole.js";
import axios from "axios";

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

