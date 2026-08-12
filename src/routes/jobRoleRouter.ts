import { Router } from "express";
import {
	getHome,
	JobRoleController,
} from "../controllers/jobRoleController.js";
import { JobRoleService } from "../services/jobRoleService.js";

const router = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);

/**
 * Route for the home page.
 */
router.get("/", getHome);

/**
	 * Route for retrieving job roles and rendering the job roles list page.
 */
router.get("/job-roles", (req, res) => controller.getJobRoles(req, res));

export default router;
