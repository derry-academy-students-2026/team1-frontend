import "express-session";
import type { AuthenticatedUser } from "../models/authenticatedUser.js";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
		user?: AuthenticatedUser;
	}
}
