import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import * as jobRoleApiService from "../services/jobRoleApiService.js";

export class JobRoleController {
	/**
	 * Initializes the controller with a job role service dependency.
	 * @param jobApiRoleService - Service instance for fetching job roles (injectable for testing)
	 */
	constructor(private readonly jobApiRoleService = jobRoleApiService) {}
	/**
	 * Handles GET /job-roles by retrieving roles from the service
	 * and rendering the job roles list page with formatted dates.
	 *
	 * @returns Renders job-role-list.njk with job roles.
	 */
	async getJobRoles(_req: Request, res: Response) {
		try {
			const jobRoles = await this.jobApiRoleService.getJobRoles();

			const jobRolesForView = jobRoles.map((jobRole) => {
				const dateValue =
					jobRole.closingDate instanceof Date
						? jobRole.closingDate
						: new Date(jobRole.closingDate);

				return {
					...jobRole,
					closingDate: dateValue.toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "numeric",
						year: "numeric",
					}),
				};
			});
			Logger.info(
				`Rendering job roles page with ${jobRolesForView.length} roles`,
			);
			res.render("job-role-list.njk", { jobRoles: jobRolesForView });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			Logger.error(`Failed to load job roles: ${message}`);
			res.status(500).send("Unable to load job roles");
		}
	}

	async getJobRole(req: Request, res: Response) {
		const id = Number(req.params.id);

		if (!Number.isInteger(id) || id <= 0) {
			res.status(404).send("Job role not found");
			return;
		}

		try {
			const jobRole = await this.jobApiRoleService.getJobRoleById(id);
			const dateValue =
				jobRole.closingDate instanceof Date
					? jobRole.closingDate
					: new Date(jobRole.closingDate);

			res.render("job-role-information.njk", {
				jobRole: {
					...jobRole,
					closingDate: dateValue.toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "numeric",
						year: "numeric",
					}),
				},
			});
		} catch (error) {
			const status = (error as { response?: { status?: number } }).response
				?.status;
			const message = error instanceof Error ? error.message : "Unknown error";

			if (status === 404) {
				Logger.error(`Job role ${id} not found: ${message}`);
				res.status(404).send("Job role not found");
				return;
			}

			Logger.error(`Failed to load job role ${id}: ${message}`);
			res.status(500).send("Unable to load job role");
		}
	}
}

/**
 * Handles GET / by rendering the homepage.
 * @returns Sends static home page HTML.
 */
export function getHome(_req: Request, res: Response) {
	res.render("index.html");
}
