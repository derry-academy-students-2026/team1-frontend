import multer from "multer";

const ALLOWED_MIMETYPES = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Parses the optional CV upload field, rejecting unsupported file types up front. */
export const cvUpload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (_req, file, callback) => {
		callback(null, ALLOWED_MIMETYPES.includes(file.mimetype));
	},
});
