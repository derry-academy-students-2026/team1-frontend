import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { validateRegistration } from "../middleware/authValidationMiddleware.js";

const router = Router();
const controller = new AuthController();

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
router.get("/register", (req, res) => controller.showRegister(req, res));

/**
 * Route for submitting a new user's registration.
 */
router.post("/register", validateRegistration, (req, res) =>
	controller.register(req, res),
);

/**
 * Route for logging out and clearing the session.
 */
router.get("/logout", (req, res) => controller.logout(req, res));

export default router;
