const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');
  
  // 1. Categories
  const categories = [
    { nom: 'Tables', slug: 'tables', description: 'Tables artisanales en bois massif' },
    { nom: 'Chaises', slug: 'chaises', description: 'Chaises et tabourets design' },
    { nom: 'Rangement', slug: 'rangement', description: 'Bibliothèques et buffets' },
  ];

  for (const cat of categories) {
    await prisma.categories.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const tableCat = await prisma.categories.findUnique({ where: { slug: 'tables' } });
  const chairCat = await prisma.categories.findUnique({ where: { slug: 'chaises' } });

  // 2. Products
  const products = [
    { 
      nom: 'Table Horizon', 
      slug: 'table-horizon', 
      description: 'Table minimaliste en frêne blanc', 
      prix: 850, 
      categorie_id: tableCat.id, 
      vedette: true 
    },
    { 
      nom: 'Chaise Sculpt', 
      slug: 'chaise-sculpt', 
      description: 'Chaise ergonomique sculptée', 
      prix: 320, 
      categorie_id: chairCat.id, 
      vedette: true 
    },
  ];

  for (const prod of products) {
    await prisma.produits.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
