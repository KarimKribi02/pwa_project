-- CreateTable
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" BIGSERIAL NOT NULL,
    "utilisateur_id" BIGINT,
    "statut" VARCHAR(50),
    "largeur" VARCHAR(100),
    "longueur" VARCHAR(100),
    "couleur" VARCHAR(100),
    "type_bois" VARCHAR(100),
    "duree" INTEGER,
    "id_produit" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facture" (
    "id_facture" BIGSERIAL NOT NULL,
    "numFacture" VARCHAR(100),
    "date_emission" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "date_paiement" TIMESTAMP(6),
    "id_commande" BIGINT,
    "id_utilisateur" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facture_pkey" PRIMARY KEY ("id_facture")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" BIGSERIAL NOT NULL,
    "categorie_id" BIGINT,
    "nom" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "description" TEXT,
    "prix" DECIMAL(10,2),
    "vedette" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits_images" (
    "id" BIGSERIAL NOT NULL,
    "produit_id" BIGINT,
    "url_image" VARCHAR(255),
    "principale" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produits_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" BIGSERIAL NOT NULL,
    "nom" VARCHAR(255),
    "email" VARCHAR(255),
    "mot_passe" VARCHAR(255),
    "role" VARCHAR(50),
    "adresse" VARCHAR(255),
    "telephone" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_id_produit_fkey" FOREIGN KEY ("id_produit") REFERENCES "produits"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facture" ADD CONSTRAINT "facture_id_commande_fkey" FOREIGN KEY ("id_commande") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facture" ADD CONSTRAINT "facture_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_categorie_id_fkey" FOREIGN KEY ("categorie_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produits_images" ADD CONSTRAINT "produits_images_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
