INSERT INTO utilisateurs (nom, email, mot_passe, role, adresse, telephone) 
VALUES ('Admin', 'admin@menuiserie.digital', 'admin123', 'admin', 'Marrakech', '+212 600000000')
ON CONFLICT (email) DO NOTHING;
