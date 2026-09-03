/** Magic-byte signatures for the file types accepted by the CV upload field. */
const SIGNATURES: { mimetype: string; bytes: number[] }[] = [
	{ mimetype: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
	{ mimetype: "application/msword", bytes: [0xd0, 0xcf, 0x11, 0xe0] }, // OLE compound file (.doc)
	{
		mimetype:
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		bytes: [0x50, 0x4b, 0x03, 0x04], // ZIP container (.docx)
	},
];

/**
 * Confirms a file's actual content matches its claimed type, since the
 * browser-reported mimetype/extension can be spoofed.
 */
export function hasValidCvSignature(file: {
	mimetype: string;
	buffer: Buffer;
}): boolean {
	const signature = SIGNATURES.find((s) => s.mimetype === file.mimetype);
	if (!signature) {
		return false;
	}
	return signature.bytes.every((byte, index) => file.buffer[index] === byte);
}
