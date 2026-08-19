/**
 * Credentials and reference data seeded into the real backend by its
 * `prisma/seed.ts` script. Keep this in sync with that script.
 */
export const testUser = {
	email: "test1@example.com",
	password: "Password123!",
};

export interface SeededJobRole {
	roleName: string;
	location: string;
	capability: string;
	band: string;
	status: string;
	closingDate: Date;
	numberOfOpenPositions: number;
	description: string;
	responsibilities: string;
}

export const seededJobRoles: SeededJobRole[] = [
	{
		roleName: "Software Engineer",
		location: "Derry",
		capability: "Engineering",
		band: "Band 2",
		status: "open",
		closingDate: new Date("2026-08-11"),
		numberOfOpenPositions: 1,
		description: "Build and maintain product features.",
		responsibilities: "Design, code, review, and deploy.",
	},
	{
		roleName: "Test Engineer",
		location: "Gdansk",
		capability: "Engineering",
		band: "Band 2",
		status: "open",
		closingDate: new Date("2026-08-14"),
		numberOfOpenPositions: 2,
		description: "Own test strategy and quality gates.",
		responsibilities: "Automate tests and report quality risks.",
	},
	{
		roleName: "Project Manager",
		location: "Belfast",
		capability: "Engineering",
		band: "Band 2",
		status: "closed",
		closingDate: new Date("2026-08-23"),
		numberOfOpenPositions: 1,
		description: "Coordinate delivery across teams.",
		responsibilities: "Plan milestones and manage stakeholders.",
	},
];

export const openJobRoles = seededJobRoles.filter(
	(role) => role.status === "open",
);

export const primaryOpenJobRole = openJobRoles[0];
export const secondaryOpenJobRole = openJobRoles[1];

export const urls = {
	login: /\/login$/,
	jobRoles: /\/job-roles$/,
};

/**
 * Reproduces the `en-GB` date formatting applied by the controllers so tests
 * can assert on the rendered closing date without duplicating magic strings.
 */
export function formatClosingDate(date: Date): string {
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "numeric",
		year: "numeric",
	});
}
