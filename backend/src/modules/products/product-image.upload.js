import multer from "multer";
import { ApiError } from "../../utils/ApiError.js";

const acceptedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!acceptedMimeTypes.has(file.mimetype)) {
      return callback(ApiError.badRequest("Formats acceptés : PNG, JPG et WEBP."));
    }
    return callback(null, true);
  },
});

// Transforme les erreurs Multer en messages API compréhensibles.
export function receiveProductImage(req, res, next) {
  upload.single("image")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(ApiError.badRequest("L’image ne doit pas dépasser 5 Mo."));
    }

    return next(error);
  });
}
