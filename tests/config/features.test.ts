import { afterEach, describe, expect, it } from "vitest";
import { isRegistrationEnabled } from "../../src/config/features.js";

const original = process.env.FEATURE_REGISTRATION_ENABLED;

afterEach(() => {
	if (original === undefined) {
		delete process.env.FEATURE_REGISTRATION_ENABLED;
	} else {
		process.env.FEATURE_REGISTRATION_ENABLED = original;
	}
});

describe("isRegistrationEnabled", () => {
	it("defaults to enabled when the variable is unset", () => {
		delete process.env.FEATURE_REGISTRATION_ENABLED;

		expect(isRegistrationEnabled()).toBe(true);
	});

	it("treats an empty value as unset rather than disabled", () => {
		process.env.FEATURE_REGISTRATION_ENABLED = "";

		expect(isRegistrationEnabled()).toBe(true);
	});

	it("is disabled when set to false", () => {
		process.env.FEATURE_REGISTRATION_ENABLED = "false";

		expect(isRegistrationEnabled()).toBe(false);
	});

	it("ignores casing", () => {
		process.env.FEATURE_REGISTRATION_ENABLED = "TRUE";
		expect(isRegistrationEnabled()).toBe(true);

		process.env.FEATURE_REGISTRATION_ENABLED = "False";
		expect(isRegistrationEnabled()).toBe(false);
	});

	it("treats any unrecognised value as disabled", () => {
		process.env.FEATURE_REGISTRATION_ENABLED = "yes";

		expect(isRegistrationEnabled()).toBe(false);
	});
});
