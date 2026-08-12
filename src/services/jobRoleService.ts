export type JobRoleStatus = "open" | "closed";

import Logger from "../lib/logger.js";

export interface JobRole {
	id: number;
	jobRoleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: string;
	status: JobRoleStatus;
}

export class JobRoleService {
	private readonly jobRoles: JobRole[] = [
		{
			id: 1,
			jobRoleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Band 2",
			closingDate: "2026-08-30",
			status: "open",
		},
		{
			id: 2,
			jobRoleName: "Product Manager",
			location: "Dublin",
			capability: "Product",
			band: "Band 3",
			closingDate: "2026-09-05",
			status: "closed",
		},
		{
			id: 3,
			jobRoleName: "QA Engineer",
			location: "London",
			capability: "Quality Assurance",
			band: "Band 2",
			closingDate: "2026-09-12",
			status: "open",
		},
	];

	/**
	 * Returns only job roles that are currently open.
	 * This enforces the ticket acceptance criteria for the job roles list page.
	 *
	 * @returns An array of job roles with status "open".
	 */
	getOpenJobRoles(): JobRole[] {
		const openRoles = this.jobRoles.filter(
			(jobRole) => jobRole.status === "open",
		);

		if (openRoles.length === 0) {
			Logger.warn("No open job roles found in JobRoleService");
		} else {
			Logger.debug(
				`JobRoleService returned ${openRoles.length} open job roles`,
			);
		}

		return openRoles;
	}
}
