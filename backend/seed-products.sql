-- Insert categories
INSERT INTO "Category" (name, description, "createdAt", "updatedAt") VALUES
('Aliments', 'Aliments pour animaux d''élevage', NOW(), NOW()),
('Alevins', 'Jeunes poissons pour pisciculture', NOW(), NOW()),
('Poissons et volailles', 'Animaux adultes pour élevage', NOW(), NOW()),
('Équipements aquacoles', 'Matériel pour fermes aquacoles', NOW(), NOW()),
('Matériel d''élevage', 'Équipement général pour élevage', NOW(), NOW());

-- Insert products
INSERT INTO "Product" (name, description, price, stock, "categoryId", "createdAt", "updatedAt") VALUES
('Aliment tilapia premium', 'Aliment complet pour tilapia - 25kg', 45000, 'IN_STOCK', 1, NOW(), NOW()),
('Alevins tilapia rouge', 'Alevins tilapia rouge - paquet de 500', 125000, 'IN_STOCK', 2, NOW(), NOW()),
('Poulets label', 'Poulets fermiers de 6 semaines', 8500, 'IN_STOCK', 3, NOW(), NOW()),
('Bassin aquacole 1000L', 'Bassin de culture en polyéthylène', 385000, 'IN_STOCK', 4, NOW(), NOW()),
('Pompe à air électrique', 'Pompe d''aération pour bassins', 95000, 'IN_STOCK', 4, NOW(), NOW()),
('Filet de pêche', 'Filet de pêche professionnel', 28000, 'IN_STOCK', 5, NOW(), NOW()),
('Nourriture automatique', 'Distributeur automatique de nourriture', 165000, 'IN_STOCK', 4, NOW(), NOW()),
('Couveuse incubatrice', 'Incubatrice automatique pour œufs', 285000, 'IN_STOCK', 5, NOW(), NOW());
