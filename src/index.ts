import "dotenv/config";
import express from "express";
import morganMiddleware from "./config/morganMiddleware";
import Logger from "./lib/logger";
import jobRouter from "./routes/jobRouter.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

Logger.info("App initialization started");

// Register Morgan middleware for logging HTTP requests
app.use(morganMiddleware);
Logger.info("Morgan HTTP middleware registered");

// Health check
app.get("/health", (_req, res) => {
	Logger.info("Health endpoint accessed");
	res.json({ status: "UP", time: new Date().toISOString() });
});

// Route requests through jobRouter.
app.use("/", jobRouter);
Logger.info("Job routes mounted at /");
Logger.error("This is a test error log to verify logging functionality");

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`📝 Try: http://localhost:${PORT}/health`);
});
