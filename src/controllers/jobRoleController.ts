import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import type { JobRoleService } from "../services/jobRoleService.js";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	/**
	 * Handles GET /job-roles by retrieving roles from the service
	 * and rendering the job roles list page with formatted dates.
	 *
	 * @returns Renders job-role-list.html with job roles.
	 */
	getJobRoles(_req: Request, res: Response) {
		const jobRoles = this.jobRoleService.getJobRoles();
		const jobRolesForView = jobRoles.map((jobRole) => ({
			...jobRole,
			closingDate: jobRole.closingDate.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "numeric",
				year: "numeric",
			}),
		}));
		Logger.info(
			`Rendering job roles page with ${jobRolesForView.length} roles`,
		);
		res.render("job-role-list.html", { jobRoles: jobRolesForView });
	}
}

export function getHome(_req: Request, res: Response) {
	res.send("<!doctype html><html><body><h1>Hello world</h1></body></html>");
}
