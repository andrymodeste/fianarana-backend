export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "eleve" | "professeur" | "admin";
  photo_url?: string;
  telephone?: string;
  ville?: string;
  region?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface Cours {
  id: number;
  professeur_id: number;
  matiere_id: number;
  niveau_id: number;
  titre: string;
  description: string;
  image_url: string;
  est_premium: number;
  est_publie: number;
  statut?: string;
  motif_rejet?: string;
  prix: number;
  duree_totale_minutes?: number;
  nombre_lecons?: number;
  langue: string;
  professeur_nom: string;
  professeur_prenom: string;
  professeur_photo?: string;
  matiere_nom: string;
  matiere_couleur?: string;
  niveau_nom: string;
  categorie_nom: string;
  note_moyenne?: number;
  nb_avis?: number;
  nb_inscrits?: number;
}

export interface Lecon {
  id: number;
  cours_id: number;
  titre: string;
  description: string;
  video_url: string;
  pdf_url: string;
  ordre: number;
  duree_minutes: number;
  est_gratuite: number;
  est_telechargeable: number;
  statut?: "valide" | "en_attente";
}

export interface Categorie {
  id: number;
  nom: string;
  description: string;
  icone_url: string;
  ordre: number;
}

export interface Matiere {
  id: number;
  categorie_id: number;
  nom: string;
  description: string;
  couleur: string;
  icone_url: string;
  categorie_nom?: string;
}

export interface Niveau {
  id: number;
  nom: string;
  description: string;
  ordre: number;
}

export interface Plan {
  id: number;
  nom: string;
  prix: number;
  duree_jours: number;
  description: string;
  fonctionnalites: string;
  est_actif: number;
}

export interface Abonnement {
  id: number;
  utilisateur_id: number;
  plan_id: number;
  statut: string;
  debut: string;
  fin: string;
  plan_nom?: string;
  prix?: number;
  duree_jours?: number;
}

export interface Inscription {
  id: number;
  eleve_id: number;
  cours_id: number;
  progression: number;
  est_termine: number;
  inscrit_le?: string;
  titre?: string;
  image_url?: string;
  description?: string;
  professeur_nom?: string;
  professeur_prenom?: string;
  matiere_nom?: string;
}

export interface Quiz {
  id: number;
  lecon_id: number;
  titre: string;
  description: string;
  duree_secondes: number;
  nombre_tentatives: number;
  score_minimum: number;
  est_actif?: number;
}

export interface Notification {
  id: number;
  utilisateur_id: number;
  titre: string;
  message: string;
  type: string;
  lien: string;
  est_lue: number;
  cree_le: string;
}

export interface Avis {
  id: number;
  eleve_id: number;
  cours_id: number;
  note: number;
  commentaire: string;
  nom: string;
  prenom: string;
  photo_url: string;
  cree_le: string;
  est_visible?: number;
}

export interface Badge {
  id: number;
  nom: string;
  description: string;
  icone_url: string;
  type: string;
  condition_valeur: number;
  obtenu_le?: string;
}

export interface Certificat {
  id: number;
  eleve_id: number;
  cours_id: number;
  code_verification: string;
  fichier_url: string;
  delivre_le: string;
  cours_titre?: string;
}
