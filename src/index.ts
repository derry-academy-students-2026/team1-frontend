import "dotenv/config";
import express from "express";
import morganMiddleware from "./config/morganMiddleware.js";
import Logger from "./lib/logger.js";
import jobRouter from "./routes/jobRouter.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

Logger.info("App initialization started");

// Register Morgan middleware for logging HTTP requests
app.use(morganMiddleware);
Logger.info("Morgan HTTP middleware registered");

// Health check
app.get("/health", (_req, res) => {
	Logger.debug("Health endpoint accessed");
	res.json({ status: "UP", time: new Date().toISOString() });
});

// Route requests through jobRouter.
app.use("/", jobRouter);
Logger.info("Job routes mounted at /");
Logger.error("This is a test error log to verify logging functionality");

// Start the server
app.listen(PORT, () => {
	Logger.info(`Server is running on port ${PORT}`);
	Logger.info(`🚀 Server running on http://localhost:${PORT}`);
	Logger.info(`📝 Try: http://localhost:${PORT}/health`);
});
