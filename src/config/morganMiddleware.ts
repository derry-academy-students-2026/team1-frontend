import morgan, { type StreamOptions } from "morgan";
import Logger from "../lib/logger";

// Route Morgan output through Winston's http level
const stream: StreamOptions = {
	write: (message) => Logger.http(message),
};

// Only log requests in development
const skip = () => {
	const env = process.env.NODE_ENV || "development";
	return env !== "development";
};

const morganMiddleware = morgan(
	":method :url :status :res[content-length] - :response-time ms",
	{ stream, skip },
);

export default morganMiddleware;
