const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runSimulation() {
  console.log('----------------------------------------------------');
  console.log('🚀 DEBUT DE LA SIMULATION DU SYSTEME MENUISERIE DIGITALE');
  console.log('----------------------------------------------------');

  let testOrderCode = 'MD-2026-TESTSIM';
  let testOrderId = null;
  let testContactId = null;

  try {
    // ----------------------------------------------------
    // Pipeline 1: Dynamic Checkout Route Simulation
    // ----------------------------------------------------
    console.log('⏳ Pipeline 1: Simulation de la validation du panier et checkout...');
    
    // Create a new order with custom dimensions & choices
    const createdOrder = await prisma.commandes.create({
      data: {
        codeSuivi: testOrderCode,
        clientNom: 'Karim Simulation',
        clientTel: '+212700000000',
        clientEmail: 'simulation@menuiserie.digital',
        adresse: 'Atelier de Simulation, Marrakech',
        largeur: '220',
        longueur: '110',
        couleur: 'Sombre Bruni',
        type_bois: 'Cèdre de l\'Atlas',
        prix_total: 14500.00,
        statut: 'en attente',
        note: 'Note de test automatisé'
      }
    });

    testOrderId = createdOrder.id;
    console.log(`✅ Commande test insérée avec succès dans Supabase.`);
    console.log(`   ID: ${createdOrder.id}`);
    console.log(`   Code de suivi: ${createdOrder.codeSuivi}`);
    console.log(`   Dimensions: ${createdOrder.largeur} x ${createdOrder.longueur} cm`);
    console.log(`   Bois: ${createdOrder.type_bois} | Couleur: ${createdOrder.couleur}\n`);

    // ----------------------------------------------------
    // Pipeline 2: Tracking Lookup Simulation
    // ----------------------------------------------------
    console.log('⏳ Pipeline 2: Simulation de la recherche de suivi...');
    const trackedOrder = await prisma.commandes.findUnique({
      where: { codeSuivi: testOrderCode }
    });

    if (!trackedOrder) {
      throw new Error(`❌ Echec: Impossible de localiser la commande avec le code ${testOrderCode}`);
    }

    console.log('✅ Recherche réussie.');
    console.log(`   Nom client: ${trackedOrder.clientNom}`);
    console.log(`   Statut: ${trackedOrder.statut}`);
    console.log(`   Dimensions récupérées: ${trackedOrder.largeur} x ${trackedOrder.longueur} cm`);
    
    // Verify values match
    if (trackedOrder.largeur !== '220' || trackedOrder.longueur !== '110') {
      throw new Error('❌ Echec: Les dimensions de la commande récupérée ne correspondent pas aux dimensions initiales.');
    }
    console.log('   -> Validation des dimensions: OK!\n');

    // ----------------------------------------------------
    // Pipeline 3: Inquiries (Contact Page) Channel Simulation
    // ----------------------------------------------------
    console.log('⏳ Pipeline 3: Simulation du formulaire de Contact...');
    const createdContact = await prisma.contact.create({
      data: {
        nom: 'Karim Prospect',
        email: 'prospect@simulation.com',
        telephone: '+212611111111',
        objet: 'Demande de Devis',
        message: 'Bonjour, je souhaiterais obtenir un devis personnalisé pour une table basse en Noyer de l\'Atlas. Merci de me contacter.',
        statut: 'Non lu'
      }
    });

    testContactId = createdContact.id;
    console.log(`✅ Demande de contact insérée avec succès.`);
    console.log(`   ID Message: ${createdContact.id}`);
    console.log(`   Sujet: ${createdContact.objet}`);
    console.log(`   Statut initial: ${createdContact.statut}\n`);

    // Retrieve all unread inbox items in the Admin space to confirm it appears instantly
    const unreadMessages = await prisma.contact.findMany({
      where: { statut: 'Non lu' }
    });

    const isMessageFound = unreadMessages.some(msg => msg.id === createdContact.id);
    if (!isMessageFound) {
      throw new Error('❌ Echec: Le nouveau message n\'apparait pas dans la liste des messages administratifs non lus.');
    }
    console.log(`✅ Le message apparait instantanément dans la boîte de réception administrative.`);
    console.log(`   -> Total des messages non lus en base: ${unreadMessages.length}\n`);

    // ----------------------------------------------------
    // End of Simulation & Cleanup
    // ----------------------------------------------------
    console.log('🧹 Nettoyage des données de test...');
    if (testOrderId) {
      await prisma.commandes.delete({ where: { id: testOrderId } });
      console.log('   - Commande de test supprimée.');
    }
    if (testContactId) {
      await prisma.contact.delete({ where: { id: testContactId } });
      console.log('   - Message de contact de test supprimé.');
    }

    console.log('\n====================================================');
    console.log('🎉 AUDIT DU SYSTEME REUSSI : 100% DES PIPELINES VALIDES');
    console.log('====================================================');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU RUN DE LA SIMULATION:');
    console.error(error);

    // Rollback / Cleanup in case of failures
    try {
      console.log('\n🧹 Nettoyage d\'urgence...');
      if (testOrderId) {
        await prisma.commandes.delete({ where: { id: testOrderId } }).catch(() => {});
      }
      if (testContactId) {
        await prisma.contact.delete({ where: { id: testContactId } }).catch(() => {});
      }
    } catch (cleanupErr) {
      console.error('Erreur lors du nettoyage d\'urgence:', cleanupErr);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSimulation();
