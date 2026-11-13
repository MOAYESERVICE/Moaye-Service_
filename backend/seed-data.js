import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  const cat1 = await prisma.category.create({
    data: {
      name: "Aliments",
      description: "Aliments pour animaux d'élevage",
    },
  });

  const cat2 = await prisma.category.create({
    data: {
      name: "Alevins",
      description: "Jeunes poissons pour pisciculture",
    },
  });

  const cat3 = await prisma.category.create({
    data: {
      name: "Poissons et volailles",
      description: "Animaux adultes pour élevage",
    },
  });

  const cat4 = await prisma.category.create({
    data: {
      name: "Équipements aquacoles",
      description: "Matériel pour fermes aquacoles",
    },
  });

  const cat5 = await prisma.category.create({
    data: {
      name: "Matériel d'élevage",
      description: "Équipement général pour élevage",
    },
  });

  // Create products
  const products = [
    {
      name: "Aliment tilapia premium",
      description: "Aliment complet pour tilapia - 25kg",
      price: 45000,
      stock: "IN_STOCK",
      categoryId: cat1.id,
      specs: ["25kg par sac", "Protéines 32%", "Livraison possible"],
    },
    {
      name: "Alevins tilapia rouge",
      description: "Alevins tilapia rouge - paquet de 500",
      price: 125000,
      stock: "IN_STOCK",
      categoryId: cat2.id,
      specs: ["500 alevins", "Âge 2-3 mois", "Taux de survie 95%"],
    },
    {
      name: "Poulets label",
      description: "Poulets fermiers de 6 semaines",
      price: 8500,
      stock: "IN_STOCK",
      categoryId: cat3.id,
      specs: ["Poids: 1,5-2kg", "Label rouge", "Élevés aux grains"],
    },
    {
      name: "Bassin aquacole 1000L",
      description: "Bassin de culture en polyéthylène",
      price: 385000,
      stock: "IN_STOCK",
      categoryId: cat4.id,
      specs: ["Capacité 1000L", "Résistant UV", "Drain inclus"],
    },
    {
      name: "Pompe à air électrique",
      description: "Pompe d'aération pour bassins",
      price: 95000,
      stock: "IN_STOCK",
      categoryId: cat4.id,
      specs: ["Débit 2000 L/h", "Consommation 30W", "Garantie 1 an"],
    },
    {
      name: "Filet de pêche",
      description: "Filet de pêche professionnel",
      price: 28000,
      stock: "IN_STOCK",
      categoryId: cat5.id,
      specs: ["Maille 10mm", "Longueur 10m", "Flotteurs inclus"],
    },
    {
      name: "Nourriture automatique",
      description: "Distributeur automatique de nourriture",
      price: 165000,
      stock: "IN_STOCK",
      categoryId: cat4.id,
      specs: ["Programmable 4 fois/jour", "Batterie 6 mois", "Portée 5m"],
    },
    {
      name: "Couveuse incubatrice",
      description: "Incubatrice automatique pour œufs",
      price: 285000,
      stock: "IN_STOCK",
      categoryId: cat5.id,
      specs: ["Capacité 168 œufs", "Retournement auto", "Contrôle humidité"],
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: p,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log(`📦 Created ${products.length} products in 5 categories`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
