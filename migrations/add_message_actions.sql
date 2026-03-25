-- Ajouter les colonnes pour modifier/retirer/supprimer les messages
ALTER TABLE messages ADD COLUMN est_modifie TINYINT(1) DEFAULT 0;
ALTER TABLE messages ADD COLUMN est_supprime_expediteur TINYINT(1) DEFAULT 0;
ALTER TABLE messages ADD COLUMN est_supprime_destinataire TINYINT(1) DEFAULT 0;
