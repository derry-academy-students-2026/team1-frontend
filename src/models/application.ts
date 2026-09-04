export interface ApplicationRequest {
	applicantName: string;
	applicantEmail: string;
	phoneNumber: string;
	address: string;
	linkedInUrl?: string;
	coverLetter: string;
	rightToWork: "yes" | "no";
	privacyConsent: "on";
}

export interface Application {
	id: number;
	roleId: number;
	applicantName: string;
	applicantEmail: string;
	phoneNumber: string;
	address: string;
	linkedInUrl?: string;
	coverLetter: string;
	rightToWork: "yes" | "no";
	privacyConsent: "on";
	status: string;
	createdAt: Date;
}
