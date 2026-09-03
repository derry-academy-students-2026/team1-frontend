import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController.js";
import { validateApplication } from "../middleware/applicationValidationMiddleware.js";
import { cvUpload } from "../middleware/cvUploadMiddleware.js";
import { validateJobRoleId } from "../middleware/jobRoleValidationMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const controller = new ApplicationController();

router.get("/job-roles/:id/apply", requireAuth, validateJobRoleId, (req, res) =>
	controller.getApplyForm(req, res),
);

router.post(
	"/job-roles/:id/apply",
	requireAuth,
	validateJobRoleId,
	cvUpload.single("cv"),
	validateApplication,
	(req, res) => controller.applyForRole(req, res),
);

export default router;
