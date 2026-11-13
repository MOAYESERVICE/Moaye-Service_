// Associe les noms de catégories en base aux codes attendus par le frontend.
const categoryToFrontend = {
  Aliments: "aliments",
  Alevins: "alevins",
  "Poissons et volailles": "animaux",
  "Équipements aquacoles": "equipements",
  "Matériel d'élevage": "materiel",
  "Intrants agricoles": "intrants",
};

// Convertit les statuts de stock vers les valeurs utilisées par le frontend.
const stockToFrontend = {
  IN_STOCK: "in",
  ON_ORDER: "order",
  OUT_OF_STOCK: "out",
};

// Transforme un produit Prisma dans le format attendu par l'interface.
export function toProductResponse(product) {
  const cat = categoryToFrontend[product.category?.name];
  const stock = stockToFrontend[product.stock];

  if (!cat) {
    throw new Error(`Catégorie inconnue : ${product.category?.name ?? "absente"}`);
  }

  if (!stock) {
    throw new Error(`Statut de stock inconnu : ${product.stock}`);
  }

  return {
    id: String(product.id),
    cat,
    name: product.name,
    price: product.price,
    stock,
    photo: product.name,
    image: product.imageUrl ?? undefined,
    desc: product.description,
    specs: product.specs ?? [],
  };
}
