import axios from "axios";
import apiClient from "../config/apiClient.js";
import logger from "../lib/logger.js";
import type { AuthenticatedUser } from "../models/authenticatedUser.js";

const AUTH_LOGIN_PATH = process.env.AUTH_LOGIN_PATH ?? "/auth/login";
const AUTH_REGISTER_PATH = process.env.AUTH_REGISTER_PATH ?? "/auth/register";

export interface LoginResult {
	token: string;
	user: AuthenticatedUser;
}

export interface RegisterResult {
	token: string;
}

/**
 * Submits credentials to the backend login endpoint.
 * Never logs the password or the returned token.
 * @throws {AxiosError} If the backend rejects the credentials or the request fails.
 */
export async function login(
	email: string,
	password: string,
): Promise<LoginResult> {
	try {
		const response = await apiClient.post<LoginResult>(AUTH_LOGIN_PATH, {
			email,
			password,
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 401 || status === 400) {
				logger.warn("Login rejected: invalid email or password");
			} else {
				logger.error(`Unexpected error during login: ${error.message}`);
			}
			throw error;
		}
		throw error;
	}
}

/**
 * Submits a new user's email and password to the backend registration endpoint.
 * Never logs the password or the returned token.
 */
export async function register(
	email: string,
	password: string,
): Promise<RegisterResult> {
	try {
		const response = await apiClient.post<RegisterResult>(AUTH_REGISTER_PATH, {
			email,
			password,
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 400) {
				logger.warn("Registration rejected: validation error");
			} else if (status === 409) {
				logger.warn("Registration rejected: account already exists");
			} else {
				logger.error(`Unexpected error during registration: ${error.message}`);
			}
			throw error;
		}
		throw error;
	}
}
