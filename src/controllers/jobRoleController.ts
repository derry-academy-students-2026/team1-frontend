import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import * as jobRoleApiService from "../services/jobRoleApiService.js";

export class JobRoleController {
	/**
	 * Initializes the controller with a job role service dependency.
	 * @param jobRoleService - Service instance for fetching job roles (injectable for testing)
	 */
	constructor(private readonly jobRoleService = jobRoleApiService) {}
	/**
	 * Handles GET /job-roles by retrieving roles from the service
	 * and rendering the job roles list page with formatted dates.
	 *
	 * @returns Renders job-role-list.html with job roles.
	 */
	async getJobRoles(_req: Request, res: Response) {
		try {
			const jobRoles = await this.jobRoleService.getJobRoles();

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
			res.render("job-role-list.html", { jobRoles: jobRolesForView });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			Logger.error(`Failed to load job roles: ${message}`);
			res.status(500).send("Unable to load job roles");
		}
	}
}

/**
 * Handles GET / by rendering the homepage.
 * @returns Sends static home page HTML.
 */
export function getHome(_req: Request, res: Response) {
	res.send("<!doctype html><html><body><h1>Hello world</h1></body></html>");
}
