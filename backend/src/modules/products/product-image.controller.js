import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError } from "../../utils/ApiError.js";

const uploadsDirectory = fileURLToPath(
  new URL("../../../uploads/products/", import.meta.url),
);

// Reconnaît le vrai format du fichier à partir de sa signature, pas de son nom.
function detectImageExtension(buffer) {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return "png";
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

// Enregistre l'image validée et renvoie son chemin public côté frontend.
export async function uploadProductImage(req, res) {
  if (!req.file) {
    throw ApiError.badRequest("Sélectionnez une image à envoyer.");
  }

  const extension = detectImageExtension(req.file.buffer);
  if (!extension) {
    throw ApiError.badRequest("Le fichier doit être une image PNG, JPG ou WEBP valide.");
  }

  const filename = `${randomUUID()}.${extension}`;
  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(path.join(uploadsDirectory, filename), req.file.buffer, { flag: "wx" });

  return res.status(201).json({
    success: true,
    data: { url: `/api/uploads/products/${filename}` },
  });
}
