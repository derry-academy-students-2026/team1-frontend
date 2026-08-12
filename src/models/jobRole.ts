export interface JobRole {
	id: number;
    jobRoleName: string;
    location: string;
    capability: string;
    band: string;
    closingDate: string;
    status: JobRoleStatus;
}

export type JobRoleStatus = "open" | "closed";