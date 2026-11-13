import {
  getAllProducts,
  createProduct as saveProduct,
  updateProduct as saveUpdatedProduct,
  deleteProduct as removeProduct,
} from "./product.service.js";
import { toProductResponse } from "./product.model.js";

// Renvoie la liste au format attendu par le frontend.
export async function listProducts(_req, res) {
  const products = await getAllProducts();

  res.status(200).json({
    success: true,
    data: products.map(toProductResponse),
  });
}

// Crée un produit validé, puis adapte la réponse au frontend.
export async function createProduct(req, res) {
  const product = await saveProduct(req.body);

  res.status(201).json({
    success: true,
    data: toProductResponse(product),
  });
}

// Valide l'identifiant HTTP avant de le transmettre à Prisma.
function parseProductId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function updateProduct(req, res) {
  const id = parseProductId(req.params.id);
  if (id === null) {
    return res.status(400).json({
      success: false,
      message: "Identifiant de produit invalide.",
    });
  }

  const product = await saveUpdatedProduct(id, req.body);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Produit introuvable.",
    });
  }

  return res.status(200).json({
    success: true,
    data: toProductResponse(product),
  });
}

export async function deleteProduct(req, res) {
  const id = parseProductId(req.params.id);
  if (id === null) {
    return res.status(400).json({
      success: false,
      message: "Identifiant de produit invalide.",
    });
  }

  const product = await removeProduct(id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Produit introuvable.",
    });
  }

  return res.status(200).json({
    success: true,
    data: toProductResponse(product),
  });
}