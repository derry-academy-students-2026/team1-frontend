import { Router } from "express";
import { getHome } from "../controllers/jobController.js";

const router = Router();
router.get("/", getHome);

export default router;