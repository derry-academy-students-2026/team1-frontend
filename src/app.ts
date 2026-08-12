import "dotenv/config";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware.js";
import Logger from "./lib/logger.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configures Nunjucks as the templating engine for the Express application.
 * Sets the views directory and enables autoescaping for security.
 */
nunjucks.configure([path.join(__dirname, "views")], {
	autoescape: true,
	express: app,
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

Logger.info("App initialization started");

/**
 * Maps the /assets route to serve static files from the public directory.
 */
app.use("/assets", express.static(path.join(__dirname, "public")));

// Register Morgan middleware for logging HTTP requests
app.use(morganMiddleware);
Logger.info("Morgan HTTP middleware registered");

// Health check
app.get("/health", (_req, res) => {
	Logger.debug("Health endpoint accessed");
	res.json({ status: "UP", time: new Date().toISOString() });
});

// Route requests through jobRoleRouter.
app.use("/", jobRoleRouter);
Logger.info("Job routes mounted at /");
Logger.error("This is a test error log to verify logging functionality");

export default app;
