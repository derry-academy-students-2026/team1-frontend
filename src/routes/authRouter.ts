import { Router } from "express";
import { isRegistrationEnabled } from "../config/features.js";
import { AuthController } from "../controllers/authController.js";
import { validateRegistration } from "../middleware/authValidationMiddleware.js";
import { requireFeature } from "../middleware/featureFlagMiddleware.js";

const router = Router();
const controller = new AuthController();

const registrationEnabled = requireFeature(
	"registration",
	isRegistrationEnabled,
);

/**
 * Route for rendering the login page.
 */
router.get("/login", (req, res) => controller.showLogin(req, res));

/**
 * Route for submitting login credentials.
 */
router.post("/login", (req, res) => controller.login(req, res));

/**
 * Route for rendering the registration page.
 */
router.get("/register", registrationEnabled, (req, res) =>
	controller.showRegister(req, res),
);

/**
 * Route for submitting a new user's registration.
 */
router.post(
	"/register",
	registrationEnabled,
	validateRegistration,
	(req, res) => controller.register(req, res),
);

/**
 * Route for logging out and clearing the session.
 */
router.get("/logout", (req, res) => controller.logout(req, res));

export default router;
