import "express-session";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
		applicationErrors?: Record<string, string>;
		applicationValues?: Record<string, string>;
		appliedJobRoleIds?: number[];
	}
}
