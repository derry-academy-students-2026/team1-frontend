/**
 * Credentials and reference data seeded into the real backend by its
 * `prisma/seed.ts` script. Keep this in sync with that script.
 */
export const testUser = {
	email: "test1@example.com",
	password: "Password123!",
};

export interface SeededJobRole {
	id: number;
	roleName: string;
	location: string;
	capability: string;
	band: string;
	status: string;
	closingDate: Date;
	numberOfOpenPositions: number;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
}

export const seededJobRoles: SeededJobRole[] = [
	{
		id: 1,
		roleName: "Software Engineer",
		location: "Derry",
		capability: "Engineering",
		band: "Band 2",
		status: "open",
		closingDate: new Date("2026-08-11"),
		numberOfOpenPositions: 1,
		description: "Build and maintain product features.",
		responsibilities: "Design, code, review, and deploy.",
		sharepointUrl: "https://example.sharepoint.com/software-engineer",
	},
	{
		id: 2,
		roleName: "Test Engineer",
		location: "Gdansk",
		capability: "Engineering",
		band: "Band 2",
		status: "open",
		closingDate: new Date("2026-08-14"),
		numberOfOpenPositions: 2,
		description: "Own test strategy and quality gates.",
		responsibilities: "Automate tests and report quality risks.",
		sharepointUrl: "https://example.sharepoint.com/test-engineer",
	},
	{
		id: 3,
		roleName: "Project Manager",
		location: "Belfast",
		capability: "Engineering",
		band: "Band 2",
		status: "closed",
		closingDate: new Date("2026-08-23"),
		numberOfOpenPositions: 1,
		description: "Coordinate delivery across teams.",
		responsibilities: "Plan milestones and manage stakeholders.",
		sharepointUrl: "https://example.sharepoint.com/project-manager",
	},
	{
		id: 4,
		roleName: "Data Engineer",
		location: "Belfast",
		capability: "Data",
		band: "Band 3",
		status: "open",
		closingDate: new Date("2026-09-01"),
		numberOfOpenPositions: 2,
		description: "Build and maintain data pipelines for analytics.",
		responsibilities: "Design ETL jobs, model data, and ensure data quality.",
		sharepointUrl: "https://example.sharepoint.com/data-engineer",
	},
	{
		id: 5,
		roleName: "Frontend Developer",
		location: "Derry",
		capability: "Engineering",
		band: "Band 2",
		status: "open",
		closingDate: new Date("2026-08-30"),
		numberOfOpenPositions: 1,
		description: "Build accessible, responsive user interfaces.",
		responsibilities: "Implement UI components and collaborate with designers.",
		sharepointUrl: "https://example.sharepoint.com/frontend-developer",
	},
	{
		id: 6,
		roleName: "Product Manager",
		location: "Belfast",
		capability: "Product",
		band: "Band 4",
		status: "open",
		closingDate: new Date("2026-09-15"),
		numberOfOpenPositions: 1,
		description: "Own the roadmap for a customer-facing product area.",
		responsibilities:
			"Define requirements, prioritise backlog, and work with stakeholders.",
		sharepointUrl: "https://example.sharepoint.com/product-manager",
	},
	{
		id: 7,
		roleName: "DevOps Engineer",
		location: "Gdansk",
		capability: "Engineering",
		band: "Band 3",
		status: "open",
		closingDate: new Date("2026-09-05"),
		numberOfOpenPositions: 1,
		description: "Improve deployment pipelines and platform reliability.",
		responsibilities:
			"Maintain CI/CD, monitor infrastructure, and automate operations.",
		sharepointUrl: "https://example.sharepoint.com/devops-engineer",
	},
	{
		id: 8,
		roleName: "UX Designer",
		location: "Derry",
		capability: "Product",
		band: "Band 2",
		status: "closed",
		closingDate: new Date("2026-08-01"),
		numberOfOpenPositions: 1,
		description: "Design end-to-end user experiences for new features.",
		responsibilities:
			"Run user research, produce wireframes, and validate prototypes.",
		sharepointUrl: "https://example.sharepoint.com/ux-designer",
	},
];

export const openJobRoles = seededJobRoles.filter(
	(role) => role.status === "open",
);
export const closedJobRoles = seededJobRoles.filter(
	(role) => role.status === "closed",
);

export const primaryOpenJobRole = openJobRoles[0];
export const secondaryOpenJobRole = openJobRoles[1];
export const primaryClosedJobRole = closedJobRoles[0];

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
