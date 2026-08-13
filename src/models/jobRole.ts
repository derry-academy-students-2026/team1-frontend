import type { Band } from "./band";
import type { Capability } from "./capability";
import type { Status } from "./status.js";

export interface JobRole {
	id: number;
	roleName: string;
	description: string;
	responsibilities: string;
	sharepointUrl: string;
	location: string;
	capability: Capability;
	band: Band;
	closingDate: Date;
	status: Status;
	numberOfOpenPositions: number;
}
