export const USER_ROLES = {
	RECRUITMENT_ADMIN: "RECRUITMENT_ADMIN",
	APPLICANT: "APPLICANT",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface AuthenticatedUser {
	id: number;
	email: string;
	role?: UserRole;
}
