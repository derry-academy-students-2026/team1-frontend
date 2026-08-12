import type { Band } from "./band";
import type { Capability } from "./capability";

export interface JobRole {
	id: number;
	roleName: string;
	location: string;
	capability: Capability;
	band: Band;
	closingDate: Date;
	status: string;
}
