/**
 * Feature flags are read per call so a new container revision picks up changes
 * without a rebuild.
 */
const isEnabled = (value: string | undefined, fallback: boolean): boolean =>
	value === undefined || value === ""
		? fallback
		: value.toLowerCase() === "true";

export const isRegistrationEnabled = (): boolean =>
	isEnabled(process.env.FEATURE_REGISTRATION_ENABLED, true);
