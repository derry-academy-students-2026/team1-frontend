import { Router } from "express";
import { AuthController } from "../controllers/authController.js";

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
 * Route for logging out and clearing the session.
 */
router.get("/logout", (req, res) => controller.logout(req, res));

export default router;
