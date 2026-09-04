import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import * as applicationApiService from "../services/applicationApiService.js";
import * as jobRoleApiService from "../services/jobRoleApiService.js";

export class ApplicationController {
	constructor(
		private readonly applicationService = applicationApiService,
		private readonly jobRoleService = jobRoleApiService,
	) {}

	async getApplyForm(req: Request, res: Response) {
		const id = Number(req.params.id);

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(
				id,
				req.session?.jwtToken,
			);

			const applicationErrors = req.session.applicationErrors;
			const applicationValues = req.session.applicationValues;
			delete req.session.applicationErrors;
			delete req.session.applicationValues;

			res.render("apply-for-role.njk", {
				jobRole,
				applicationErrors,
				...(applicationValues ?? {}),
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

	async getApplicationConfirmation(req: Request, res: Response) {
		const id = Number(req.params.id);

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(
				id,
				req.session?.jwtToken,
			);
			res.render("application-received.njk", { jobRole });
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
			rightToWork,
			privacyConsent,
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
					rightToWork,
					privacyConsent,
				},
				req.session?.jwtToken,
			);

			req.session.appliedJobRoleIds = [
				...new Set([...(req.session.appliedJobRoleIds ?? []), id]),
			];

			res.redirect(`/job-roles/${id}/apply/confirmation`);
		} catch (error) {
			const status = (error as { response?: { status?: number } }).response
				?.status;
			const backendMessage = (
				error as { response?: { data?: { message?: string } } }
			).response?.data?.message;
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
						? (backendMessage ?? "Check the details you entered and try again")
						: "Unable to submit your application. Please try again.";

			Logger.error(`Failed to apply for job role ${id}: ${message}`);

			req.session.applicationErrors = { _form: errorMessage };
			req.session.applicationValues = {
				applicantName: typeof applicantName === "string" ? applicantName : "",
				applicantEmail:
					typeof applicantEmail === "string" ? applicantEmail : "",
				phoneNumber: typeof phoneNumber === "string" ? phoneNumber : "",
				address: typeof address === "string" ? address : "",
				linkedInUrl: typeof linkedInUrl === "string" ? linkedInUrl : "",
				coverLetter: typeof coverLetter === "string" ? coverLetter : "",
				rightToWork: typeof rightToWork === "string" ? rightToWork : "",
				privacyConsent:
					typeof privacyConsent === "string" ? privacyConsent : "",
			};
			res.redirect(`/job-roles/${id}/apply`);
		}
	}
}
