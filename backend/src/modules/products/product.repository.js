// Importe le client partagé qui communique avec PostgreSQL.
import { prisma } from "../../config/database.js"

// Récupère les produits de la base, du plus récent au plus ancien.
export function findAllProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

// Cherche une catégorie par son nom exact pour obtenir son identifiant Prisma.
export function findCategoryByName(name) {
  return prisma.category.findUnique({
    where: { name },
  })
}

// Enregistre un nouveau produit dans la table Product.
export function createProduct(data) {
  // Inclut la catégorie pour que la réponse respecte le format frontend.
  return prisma.product.create({
    data,
    include: { category: true },
  })
}

// Met à jour un produit; Prisma signale explicitement l'absence avec P2025.
export async function updateProduct(id, data) {
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data,
        include: { category: true },
      });
      const cardData = { title: data.name };
      if (typeof data.imageUrl !== "undefined") cardData.imageUrl = data.imageUrl;
      await tx.homepagePhoto.updateMany({ where: { productId: id }, data: cardData });
      return product;
    })
  } catch (error) {
    if (error?.code === "P2025") return null
    throw error
  }
}

// Supprime un produit et renvoie null si son identifiant n'existe pas.
export async function deleteProduct(id) {
  try {
    return await prisma.product.delete({
      where: { id },
      include: { category: true },
    })
  } catch (error) {
    if (error?.code === "P2025") return null
    throw error
  }
}
