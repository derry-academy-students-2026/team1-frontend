import { Band } from "./band";
import { Capability } from "./capability";

export interface JobRole {
	id: number;
    roleName: string;
    location: string;
    capability: Capability;
    band: Band;
    closingDate: Date;
    status: string;
}

