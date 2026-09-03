import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import * as jobRoleApiService from "../services/jobRoleApiService.js";

function isUnauthorized(error: unknown): boolean {
	return (
		(error as { response?: { status?: number } })?.response?.status === 401
	);
}

export class JobRoleController {
	/**
	 * Initializes the controller with a job role service dependency.
	 * @param jobApiRoleService - Service instance for fetching job roles (injectable for testing)
	 */
	constructor(private readonly jobApiRoleService = jobRoleApiService) {}

	/** Reads a string query param used to repopulate the apply form after a redirect. */
	private flashField(req: Request, field: string): string {
		const value = req.query?.[field];
		return typeof value === "string" ? value : "";
	}

	/**
	 * Handles GET /job-roles by retrieving roles from the service
	 * and rendering the job roles list page with formatted dates.
	 *
	 * @returns Renders job-role-list.njk with job roles.
	 */
	async getJobRoles(req: Request, res: Response) {
		try {
			const jobRoles = await this.jobApiRoleService.getJobRoles(
				req.session?.jwtToken,
			);

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

			if (isUnauthorized(error)) {
				Logger.warn("Backend rejected the session token, re-authenticating");
				res.redirect("/logout");
				return;
			}

			Logger.error(`Failed to load job roles: ${message}`);
			res.status(500).send("Unable to load job roles");
		}
	}

	/**
	 * Handles GET /job-roles/:id by retrieving a single job role from the service
	 * and rendering the job role information page with formatted dates.
	 *
	 * @param req - Express request object containing the job role ID in params
	 * @param res - Express response object for sending the rendered view or error
	 * @returns Renders job-role-information.njk with the job role data or sends a 404/500 error response
	 */
	async getJobRole(req: Request, res: Response) {
		const id = Number(req.params.id);

		if (!Number.isInteger(id) || id <= 0) {
			res.status(404).send("Job role not found");
			return;
		}

		try {
			const jobRole = await this.jobApiRoleService.getJobRoleById(
				id,
				req.session?.jwtToken,
			);
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
				applySuccess: req.query?.applySuccess === "1",
			});
		} catch (error) {
			const status = (error as { response?: { status?: number } }).response
				?.status;
			const message = error instanceof Error ? error.message : "Unknown error";

			if (status === 401) {
				Logger.warn("Backend rejected the session token, re-authenticating");
				res.redirect("/logout");
				return;
			}

			if (status === 404) {
				Logger.error(`Job role ${id} not found: ${message}`);
				res.status(404).send("Job role not found");
				return;
			}

			Logger.error(`Failed to load job role ${id}: ${message}`);
			res.status(500).send("Unable to load job role");
		}
	}

	/**
	 * Handles GET /job-roles/:id/apply by retrieving the job role and rendering
	 * a dedicated page for the applicant to enter their name and email.
	 *
	 * @param req - Express request object containing the job role ID in params
	 * @param res - Express response object for sending the rendered view or error
	 */
	async getApplyForm(req: Request, res: Response) {
		const id = Number(req.params.id);

		if (!Number.isInteger(id) || id <= 0) {
			res.status(404).send("Job role not found");
			return;
		}

		try {
			const jobRole = await this.jobApiRoleService.getJobRoleById(
				id,
				req.session?.jwtToken,
			);

			res.render("apply-for-role.njk", {
				jobRole,
				applyError:
					typeof req.query?.applyError === "string"
						? req.query.applyError
						: undefined,
				applicantName: this.flashField(req, "applicantName"),
				applicantEmail: this.flashField(req, "applicantEmail"),
				phoneNumber: this.flashField(req, "phoneNumber"),
				address: this.flashField(req, "address"),
				linkedInUrl: this.flashField(req, "linkedInUrl"),
				coverLetter: this.flashField(req, "coverLetter"),
			});
		} catch (error) {
			const status = (error as { response?: { status?: number } }).response
				?.status;
			const message = error instanceof Error ? error.message : "Unknown error";

			if (status === 401) {
				Logger.warn("Backend rejected the session token, re-authenticating");
				res.redirect("/logout");
				return;
			}

			if (status === 404) {
				Logger.error(`Job role ${id} not found: ${message}`);
				res.status(404).send("Job role not found");
				return;
			}

			Logger.error(`Failed to load job role ${id}: ${message}`);
			res.status(500).send("Unable to load job role");
		}
	}

	/**
	 * Handles POST /job-roles/:id/apply by submitting the applicant's name and
	 * email to the backend, then redirecting (Post/Redirect/Get) to the job
	 * role page with a success flash on success, or back to the apply page
	 * with an error flash and preserved input on failure.
	 *
	 * @param req - Express request object containing the job role ID in params
	 * and the validated applicantName/applicantEmail in the body
	 * @param res - Express response object used to redirect after processing
	 */
	async applyForRole(req: Request, res: Response) {
		const id = Number(req.params.id);

		if (!Number.isInteger(id) || id <= 0) {
			res.status(404).send("Job role not found");
			return;
		}

		const {
			applicantName,
			applicantEmail,
			phoneNumber,
			address,
			linkedInUrl,
			coverLetter,
		} = req.body;

		try {
			await this.jobApiRoleService.applyForJobRole(
				id,
				{
					applicantName,
					applicantEmail,
					phoneNumber,
					address,
					linkedInUrl,
					coverLetter,
				},
				req.session?.jwtToken,
			);
			res.redirect(`/job-roles/${id}?applySuccess=1`);
		} catch (error) {
			const status = (error as { response?: { status?: number } }).response
				?.status;
			const message = error instanceof Error ? error.message : "Unknown error";

			if (status === 401) {
				Logger.warn("Backend rejected the session token, re-authenticating");
				res.redirect("/logout");
				return;
			}

			const errorMessage =
				status === 409
					? "You have already applied for this role"
					: status === 400
						? "Enter a valid name and email address"
						: "Unable to submit your application. Please try again.";

			Logger.error(`Failed to apply for job role ${id}: ${message}`);

			const params = new URLSearchParams({
				applyError: errorMessage,
				applicantName: typeof applicantName === "string" ? applicantName : "",
				applicantEmail:
					typeof applicantEmail === "string" ? applicantEmail : "",
				phoneNumber: typeof phoneNumber === "string" ? phoneNumber : "",
				address: typeof address === "string" ? address : "",
				linkedInUrl: typeof linkedInUrl === "string" ? linkedInUrl : "",
				coverLetter: typeof coverLetter === "string" ? coverLetter : "",
			});
			res.redirect(`/job-roles/${id}/apply?${params.toString()}`);
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
