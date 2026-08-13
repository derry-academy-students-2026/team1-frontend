import Logger from "../lib/logger.js";
import type { Status } from "../models/status.js";

interface JobRole {
	id: number;
	roleName: string;
	location: string;
	capability: string;
	band: string;
	closingDate: Date;
	status: Status;
}

export class JobRoleService {
	private readonly jobRoles: JobRole[] = [
		{
			id: 1,
			roleName: "Software Engineer",
			location: "Belfast",
			capability: "Engineering",
			band: "Band 2",
			closingDate: new Date("2026-08-30"),
			status: { id: 1, name: "open" },
		},
		{
			id: 2,
			roleName: "Product Manager",
			location: "Dublin",
			capability: "Product",
			band: "Band 3",
			closingDate: new Date("2026-09-05"),
			status: { id: 2, name: "closed" },
		},
		{
			id: 3,
			roleName: "QA Engineer",
			location: "London",
			capability: "Quality Assurance",
			band: "Band 2",
			closingDate: new Date("2026-09-12"),
			status: { id: 1, name: "open" },
		},
	];

	/**
	 * Returns all available job roles from the current data source.
	 *
	 * @returns An array of job roles.
	 */
	getJobRoles(): JobRole[] {
		if (this.jobRoles.length === 0) {
			Logger.warn("No job roles found in JobRoleService");
		} else {
			Logger.debug(`JobRoleService returned ${this.jobRoles.length} job roles`);
		}

		return this.jobRoles;
	}
}
