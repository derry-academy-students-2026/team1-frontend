import { Router } from "express";
import {
	getHome,
	JobRoleController,
} from "../controllers/jobRoleController.js";
import { validateApplication } from "../middleware/applicationValidationMiddleware.js";
import { cvUpload } from "../middleware/cvUploadMiddleware.js";
import { validateJobRoleId } from "../middleware/jobRoleValidationMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const controller = new JobRoleController();

/**
 * Route for the home page.
 */
router.get("/", getHome);

/**
 * Route for retrieving job roles and rendering the job roles list page.
 */
router.get("/job-roles", requireAuth, (req, res) =>
	controller.getJobRoles(req, res),
);

// Route for retrieving one job role and rendering its information page.
router.get("/job-roles/:id", requireAuth, validateJobRoleId, (req, res) =>
	controller.getJobRole(req, res),
);

// Route for displaying the apply form for a job role.
router.get("/job-roles/:id/apply", requireAuth, validateJobRoleId, (req, res) =>
	controller.getApplyForm(req, res),
);

// Route for submitting an application for a job role.
router.post(
	"/job-roles/:id/apply",
	requireAuth,
	validateJobRoleId,
	cvUpload.single("cv"),
	validateApplication,
	(req, res) => controller.applyForRole(req, res),
);

export default router;
