export interface ApplicationRequest {
	applicantName: string;
	applicantEmail: string;
	phoneNumber: string;
	address: string;
	linkedInUrl?: string;
	coverLetter: string;
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
	status: string;
	createdAt: Date;
}
