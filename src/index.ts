import "dotenv/config";
import express from "express";
import jobRouter from "./routes/jobRouter.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "UP", time: new Date().toISOString() });
});

// Route requests through jobRouter.
app.use("/", jobRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Try: http://localhost:${PORT}/health`);
});