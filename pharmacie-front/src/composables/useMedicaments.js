import { ref, computed } from 'vue';
import api from '../services/apiService';

export function useMedicaments(afficherNotification) {
  const medicaments = ref([]);
  const chargement = ref(false);

  const chargerPharmacie = async () => {
    chargement.value = true;
    try {
      const reponse = await api.getMedicaments();
      if (reponse.data._embedded && reponse.data._embedded.medicaments) {
        medicaments.value = reponse.data._embedded.medicaments;
      }
    } catch (e) {
      console.error(e);
      afficherNotification("Erreur de connexion à la base de données", "error");
    } finally {
      chargement.value = false;
    }
  };

  const modifierStock = async (med, delta) => {
    const nouvelleQte = med.unitesEnStock + delta;
    if (nouvelleQte < 0) return;

    const qteOriginale = med.unitesEnStock;
    med.unitesEnStock = nouvelleQte;

    try {
      await api.modifierStatut(med._links.self.href, { unitesEnStock: nouvelleQte });
      await chargerPharmacie(); 
    } catch (e) {
      med.unitesEnStock = qteOriginale;
      afficherNotification("Erreur serveur lors de la mise à jour du stock", "error");
    }
  };

  const archiverMedicament = async (med) => {
    try {
      await api.modifierStatut(med._links.self.href, { indisponible: true });
      afficherNotification("Médicament archivé avec succès", "info");
      await chargerPharmacie();
    } catch (e) {
      afficherNotification("Erreur lors de l'archivage", "error");
    }
  };

  const restaurerMedicament = async (med) => {
    try {
      await api.modifierStatut(med._links.self.href, { indisponible: false });
      afficherNotification("Médicament restauré avec succès", "success");
      await chargerPharmacie();
    } catch (e) {
      afficherNotification("Erreur lors de la restauration", "error");
    }
  };

  const enregistrerMedicament = async (donnees, medicamentAEditer, fermerDialogue) => {
    try {
      const { _links, reference, ...donneesPropres } = donnees;
      const medicamentAEnvoyer = {
        ...donneesPropres,
        categorie: donnees.categorie?._links?.self?.href || donnees.categorie
      };

      if (medicamentAEditer) {
        await api.modifierMedicament(medicamentAEditer._links.self.href, medicamentAEnvoyer);
        afficherNotification("Médicament mis à jour", "success");
      } else {
        await api.ajouterMedicament(medicamentAEnvoyer);
        afficherNotification("Médicament ajouté", "success");
      }

      fermerDialogue();
      await chargerPharmacie(); 
    } catch (e) {
      const messageErreur = e.response?.data?.message || "Erreur de validation (400)";
      afficherNotification(messageErreur, "error");
    }
  };

  return {
    medicaments,
    chargement,
    chargerPharmacie,
    modifierStock,
    archiverMedicament,
    restaurerMedicament,
    enregistrerMedicament
  };
}