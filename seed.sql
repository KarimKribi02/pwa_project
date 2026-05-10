-- Create category
INSERT INTO categories (nom, slug, description) VALUES ('Tables', 'tables', 'Tables artisanales') ON CONFLICT (slug) DO NOTHING;

-- Create product
INSERT INTO produits (nom, slug, description, prix, categorie_id, vedette) 
SELECT 'Table Chêne Massif', 'table-chene', 'Magnifique table en chêne', 450.00, id, true 
FROM categories WHERE slug = 'tables'
ON CONFLICT DO NOTHING;
