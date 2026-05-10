-- 1. Nettoyage (Optionnel)
-- TRUNCATE TABLE categories, produits, utilisateurs, commandes CASCADE;

-- 2. Insertion des Catégories
INSERT INTO categories (nom, slug, description) VALUES
('Tables', 'tables', 'Tables artisanales en bois massif (Chêne, Noyer, Frêne)'),
('Chaises', 'chaises', 'Chaises et tabourets design au confort exceptionnel'),
('Rangement', 'rangement', 'Bibliothèques, buffets et étagères sur mesure'),
('Décoration', 'decoration', 'Objets décoratifs et petits accessoires en bois')
ON CONFLICT (slug) DO NOTHING;

-- 3. Insertion des Produits (Liés aux catégories)
INSERT INTO produits (nom, slug, description, prix, categorie_id, vedette) VALUES
('Table Horizon', 'table-horizon', 'Table minimaliste en frêne blanc, idéale pour 6 personnes.', 850.00, (SELECT id FROM categories WHERE slug='tables'), true),
('Chaise Sculpt', 'chaise-sculpt', 'Chaise ergonomique sculptée dans une seule pièce de noyer.', 320.00, (SELECT id FROM categories WHERE slug='chaises'), true),
('Buffet Nordic', 'buffet-nordic', 'Buffet bas en chêne clair avec portes coulissantes.', 1200.00, (SELECT id FROM categories WHERE slug='rangement'), false),
('Miroir Sylve', 'miroir-sylve', 'Miroir avec cadre en bois flotté naturel.', 150.00, (SELECT id FROM categories WHERE slug='decoration'), false),
('Table de Conférence', 'table-conference', 'Grande table de réunion en bois de cèdre recyclé.', 2500.00, (SELECT id FROM categories WHERE slug='tables'), true)
ON CONFLICT (slug) DO NOTHING;

-- 4. Insertion des Images de Produits
INSERT INTO produits_images (produit_id, url_image, principale) VALUES
((SELECT id FROM produits WHERE slug='table-horizon'), 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88', true),
((SELECT id FROM produits WHERE slug='chaise-sculpt'), 'https://images.unsplash.com/photo-1503602642458-232111445657', true),
((SELECT id FROM produits WHERE slug='buffet-nordic'), 'https://images.unsplash.com/photo-1595428774223-ef52624120d2', true);

-- 5. Insertion de quelques Commandes de test (si au moins un utilisateur existe)
INSERT INTO commandes (client_id, prix_total, statut, note, largeur, longueur, couleur, type_bois)
SELECT id, 1170.00, 'Livré', 'Client très satisfait', '90cm', '200cm', 'Naturel', 'Noyer' FROM utilisateurs LIMIT 1;
