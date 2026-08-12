import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import type { JobRoleService } from "../services/jobRoleService.js";

export class JobRoleController {
	constructor(private readonly jobRoleService: JobRoleService) {}

	/**
	 * Handles GET /job-roles by retrieving open roles from the service
	 * and rendering the job roles list page.
	 *
	 * @returns Renders job-role-list.html with open job roles.
	 */
	getJobRoles(_req: Request, res: Response) {
		const openJobRoles = this.jobRoleService.getOpenJobRoles();
		Logger.info(
			`Rendering job roles page with ${openJobRoles.length} open roles`,
		);
		res.render("job-role-list.html", { jobRoles: openJobRoles });
	}
}

export function getHome(_req: Request, res: Response) {
	res.send("<!doctype html><html><body><h1>Hello world</h1></body></html>");
}
