import "dotenv/config";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import morganMiddleware from "./config/morganMiddleware.js";
import Logger from "./lib/logger.js";
import authRouter from "./routes/authRouter.js";
import jobRoleRouter from "./routes/jobRoleRouter.js";

const app = express();

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
	throw new Error(
		"SESSION_SECRET environment variable must be set in production",
	);
}

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

// Parse login form submissions
app.use(express.urlencoded({ extended: true }));

// Register Morgan middleware for logging HTTP requests
app.use(morganMiddleware);
Logger.info("Morgan HTTP middleware registered");

app.use(
	session({
		secret: process.env.SESSION_SECRET ?? "dev-session-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		},
	}),
);
Logger.info("Session middleware registered");

// Exposes login state to views without leaking the token itself
app.use((req, res, next) => {
	res.locals.isAuthenticated = Boolean(req.session.jwtToken);
	next();
});

// Health check
app.get("/health", (_req, res) => {
	Logger.debug("Health endpoint accessed");
	res.json({ status: "UP", time: new Date().toISOString() });
});

// Route requests through jobRoleRouter.
app.use("/", jobRoleRouter);
Logger.info("Job routes mounted at /");

// Route requests through authRouter.
app.use("/", authRouter);
Logger.info("Auth routes mounted at /");

export default app;
