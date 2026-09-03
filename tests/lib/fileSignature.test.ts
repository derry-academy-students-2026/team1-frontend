import { describe, expect, it } from "vitest";
import { hasValidCvSignature } from "../../src/lib/fileSignature.js";

describe("hasValidCvSignature", () => {
	it("accepts a buffer starting with the PDF signature", () => {
		const file = {
			mimetype: "application/pdf",
			buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]),
		};

		expect(hasValidCvSignature(file)).toBe(true);
	});

	it("accepts a buffer starting with the DOCX (zip) signature", () => {
		const file = {
			mimetype:
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
		};

		expect(hasValidCvSignature(file)).toBe(true);
	});

	it("rejects a buffer whose bytes do not match the claimed mimetype", () => {
		const file = {
			mimetype: "application/pdf",
			buffer: Buffer.from("plain text pretending to be a pdf"),
		};

		expect(hasValidCvSignature(file)).toBe(false);
	});

	it("rejects an unrecognized mimetype", () => {
		const file = {
			mimetype: "application/octet-stream",
			buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
		};

		expect(hasValidCvSignature(file)).toBe(false);
	});
});
