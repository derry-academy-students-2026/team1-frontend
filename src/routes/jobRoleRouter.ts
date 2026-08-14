import { Router } from "express";
import {
	getHome,
	JobRoleController,
} from "../controllers/jobRoleController.js";
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
router.get("/job-roles/:id", requireAuth, (req, res) =>
	controller.getJobRole(req, res),
);

export default router;
