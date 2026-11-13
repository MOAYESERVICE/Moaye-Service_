import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding products...");

  // Créer une catégorie
  const category = await prisma.category.create({
    data: {
      name: "Électronique",
      description: "Produits électroniques",
    },
  });

  console.log("✅ Category created:", category.name);

  // Créer des produits
  const products = [
    {
      name: "iPhone 15",
      description: "Smartphone Apple",
      price: 99999,
      stock: "IN_STOCK",
      categoryId: category.id,
    },
    {
      name: "Samsung Galaxy S24",
      description: "Smartphone Samsung",
      price: 79999,
      stock: "IN_STOCK",
      categoryId: category.id,
    },
    {
      name: "MacBook Pro",
      description: "Ordinateur portable Apple",
      price: 199999,
      stock: "IN_STOCK",
      categoryId: category.id,
    },
    {
      name: "AirPods Pro",
      description: "Écouteurs sans fil",
      price: 24999,
      stock: "IN_STOCK",
      categoryId: category.id,
    },
    {
      name: "iPad Pro",
      description: "Tablette Apple",
      price: 99999,
      stock: "ON_ORDER",
      categoryId: category.id,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log("✅ Product created:", created.name);
  }

  console.log("\n🎉 Seeding complete!");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
