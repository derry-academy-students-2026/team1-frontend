import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import * as applicationApiService from "../services/applicationApiService.js";
import * as jobRoleApiService from "../services/jobRoleApiService.js";

export class ApplicationController {
	constructor(
		private readonly applicationService = applicationApiService,
		private readonly jobRoleService = jobRoleApiService,
	) {}

	/** Reads a string query param used to repopulate the apply form after a redirect. */
	private flashField(req: Request, field: string): string {
		const value = req.query?.[field];
		return typeof value === "string" ? value : "";
	}

	async getApplyForm(req: Request, res: Response) {
		const id = Number(req.params.id);

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(
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

	/** Post/Redirect/Get: flashes success or an error with preserved input. */
	async applyForRole(req: Request, res: Response) {
		const id = Number(req.params.id);

		const {
			applicantName,
			applicantEmail,
			phoneNumber,
			address,
			linkedInUrl,
			coverLetter,
		} = req.body;

		try {
			await this.applicationService.applyForJobRole(
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
						? "Check the details you entered and try again"
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
