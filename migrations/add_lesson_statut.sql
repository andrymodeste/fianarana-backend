-- Ajouter un statut aux leçons pour la validation admin
-- Les leçons ajoutées à un cours déjà validé doivent être validées par l'admin

ALTER TABLE lecons
ADD COLUMN statut ENUM('valide', 'en_attente') NOT NULL DEFAULT 'valide'
AFTER est_telechargeable;
