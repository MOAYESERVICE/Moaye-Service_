import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "./product.controller.js";
import { createProductSchema } from "./product.validation.js";
import { uploadProductImage } from "./product-image.controller.js";
import { receiveProductImage } from "./product-image.upload.js";

const productRouter = Router();

// Seul un administrateur peut téléverser une photo produit (max. 5 Mo).
productRouter.post(
  "/upload-image",
  requireAuth,
  requireRole("ADMIN"),
  receiveProductImage,
  uploadProductImage,
);

// Le catalogue peut être consulté publiquement.
productRouter.get("/", listProducts);

// La création exige une session, le rôle admin, puis des données valides.
productRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validateBody(createProductSchema),
  createProduct,
);

// La modification exige les mêmes contrôles et les champs complets du formulaire.
productRouter.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validateBody(createProductSchema),
  updateProduct,
);

// La suppression est également réservée aux comptes administrateurs.
productRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  deleteProduct,
);

export default productRouter;
