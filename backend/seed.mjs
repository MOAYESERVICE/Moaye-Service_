import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 Seeding database...");

  try {
    // Create categories
    const cat1 = await prisma.category.create({
      data: {
        name: "Aliments",
        description: "Aliments pour animaux d'élevage",
      },
    });
    console.log("✅ Created category: Aliments");

    const cat2 = await prisma.category.create({
      data: {
        name: "Alevins",
        description: "Jeunes poissons pour pisciculture",
      },
    });
    console.log("✅ Created category: Alevins");

    const cat3 = await prisma.category.create({
      data: {
        name: "Poissons et volailles",
        description: "Animaux adultes pour élevage",
      },
    });
    console.log("✅ Created category: Poissons et volailles");

    const cat4 = await prisma.category.create({
      data: {
        name: "Équipements aquacoles",
        description: "Matériel pour fermes aquacoles",
      },
    });
    console.log("✅ Created category: Équipements aquacoles");

    const cat5 = await prisma.category.create({
      data: {
        name: "Matériel d'élevage",
        description: "Équipement général pour élevage",
      },
    });
    console.log("✅ Created category: Matériel d'élevage");

    // Create products
    const products = [
      { name: "Aliment tilapia premium", description: "Aliment complet pour tilapia - 25kg", price: 45000, categoryId: cat1.id },
      { name: "Alevins tilapia rouge", description: "Alevins tilapia rouge - paquet de 500", price: 125000, categoryId: cat2.id },
      { name: "Poulets label", description: "Poulets fermiers de 6 semaines", price: 8500, categoryId: cat3.id },
      { name: "Bassin aquacole 1000L", description: "Bassin de culture en polyéthylène", price: 385000, categoryId: cat4.id },
      { name: "Pompe à air électrique", description: "Pompe d'aération pour bassins", price: 95000, categoryId: cat4.id },
      { name: "Filet de pêche", description: "Filet de pêche professionnel", price: 28000, categoryId: cat5.id },
      { name: "Nourriture automatique", description: "Distributeur automatique de nourriture", price: 165000, categoryId: cat4.id },
      { name: "Couveuse incubatrice", description: "Incubatrice automatique pour œufs", price: 285000, categoryId: cat5.id },
    ];

    for (const p of products) {
      await prisma.product.create({
        data: { ...p, stock: "IN_STOCK" },
      });
      console.log(`✅ Created product: ${p.name}`);
    }

    console.log("\n✨ Database seeded successfully!");
    console.log(`📦 Created ${products.length} products in 5 categories`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
