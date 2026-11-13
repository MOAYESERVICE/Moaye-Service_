import {
  findAllProducts,
  findCategoryByName,
  createProduct as saveProduct,
  updateProduct as updateSavedProduct,
  deleteProduct as deleteSavedProduct,
} from "./product.repository.js";
import { ApiError } from "../../middlewares/errorHandler.js";

// Convertit le statut frontend vers l'enum utilisé par Prisma.
const stockToDatabase = {
  in: "IN_STOCK",
  order: "ON_ORDER",
  out: "OUT_OF_STOCK",
};

// Traduit le code stable envoyé par le frontend en nom de catégorie en base.
const categoryNames = {
  aliments: "Aliments",
  alevins: "Alevins",
  animaux: "Poissons et volailles",
  equipements: "Équipements aquacoles",
  materiel: "Matériel d'élevage",
  intrants: "Intrants agricoles",
};

// Délègue la lecture au repository Prisma.
export function getAllProducts() {
  return findAllProducts();
}

// Adapte les noms de champs frontend au modèle Product de la base.
export async function createProduct(data) {
  return saveProduct(await toDatabase(data));
}

// Réutilise la même conversion que la création pour garder les formats cohérents.
export async function updateProduct(id, data) {
  return updateSavedProduct(id, await toDatabase(data));
}

export function deleteProduct(id) {
  return deleteSavedProduct(id);
}

async function toDatabase(data) {
  const categoryName = categoryNames[data.cat];
  const category = categoryName
    ? await findCategoryByName(categoryName)
    : null;

  if (!category) {
    throw new ApiError(
      `La catégorie « ${categoryName ?? data.cat} » n'existe pas dans la base.`,
      400,
    );
  }

  return {
    categoryId: category.id,
    name: data.name,
    description: data.desc ?? "",
    price: data.price,
    stock: stockToDatabase[data.stock],
    imageUrl: data.image,
    specs: data.specs ?? [],
  };
}
