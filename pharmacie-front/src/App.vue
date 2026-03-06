<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import MedicamentItem from './components/MedicamentItem.vue';
import MedicamentFormulaire from './components/MedicamentFormulaire.vue';
import SplashScreen from './components/SplashScreen.vue';
import ArchivesDialog from './components/ArchivesDialog.vue';
import SocialSignature from './components/SocialSignature.vue';

const API_URL = 'https://pharmaciebackend.onrender.com/api';

const medicaments = ref([]);
const recherche = ref('');
const chargement = ref(false);
const dialogueOuvert = ref(false);
const medicamentAEditer = ref(null);
const dialogueArchivesOuvert = ref(false);
const chargementInitial = ref(true); 
const progression = ref(0);
const ordreTri = ref('plus-recent'); 
const optionsDeTri = [
  { titre: 'Plus récent (défaut)', valeur: 'plus-recent' },
  { titre: 'Plus ancien', valeur: 'plus-ancien' },
  { titre: 'Alphabétique (A-Z)', valeur: 'alpha-asc' },
  { titre: 'Alphabétique (Z-A)', valeur: 'alpha-desc' },
  { titre: 'Stock (Croissant)', valeur: 'stock-asc' },
  { titre: 'Stock (Décroissant)', valeur: 'stock-desc' }
];
const snackbar = ref({ visible: false, message: '', couleur: '' });

const chargerPharmacie = async (estPremierChargement = false) => {
  if (estPremierChargement) {
    chargementInitial.value = true;
    progression.value = 0;
    
    const intervalle = setInterval(() => {
      if (progression.value < 85) progression.value += 15;
    }, 200);

    try {
      const reponse = await axios.get(`${API_URL}/medicaments?size=200`);
      if (reponse.data._embedded && reponse.data._embedded.medicaments) {
        medicaments.value = reponse.data._embedded.medicaments;
      }
      progression.value = 100;
      clearInterval(intervalle);
      
      setTimeout(() => {
        chargementInitial.value = false;
      }, 600);
      
    } catch (erreur) {
      console.error("Erreur lors du chargement :", erreur);
      afficherNotification("Erreur de connexion à la base de données", "error");
      clearInterval(intervalle);
    }
  } else {
    chargement.value = true;
    try {
      const reponse = await axios.get(`${API_URL}/medicaments?size=200`);
      if (reponse.data._embedded && reponse.data._embedded.medicaments) {
        medicaments.value = reponse.data._embedded.medicaments;
      }
    } catch (e) {
      console.error(e);
    } finally {
      chargement.value = false;
    }
  }
};

const modifierStock = async (med, delta) => {
  const nouvelleQte = med.unitesEnStock + delta;
  if (nouvelleQte < 0) return;

  const qteOriginale = med.unitesEnStock;
  med.unitesEnStock = nouvelleQte;

  try {
    await axios.patch(med._links.self.href, { 
      unitesEnStock: nouvelleQte 
    });
    await chargerPharmacie(); 
  } catch (e) {
    med.unitesEnStock = qteOriginale;
    afficherNotification("Erreur serveur", "error");
  }
};

const supprimerMedicament = async (med) => {
  if (confirm("Voulez-vous archiver (désactiver) ce médicament ?")) {
    try {
      await axios.patch(med._links.self.href, { indisponible: true });
      afficherNotification("Médicament archivé avec succès", "info");
      await chargerPharmacie();
    } catch (e) {
      afficherNotification("Erreur lors de l'archivage", "error");
    }
  }
};

const enregistrerMedicament = async (donnees) => {
  try {
    const { _links, reference, ...donneesPropres } = donnees;

    const medicamentAEnvoyer = {
      ...donneesPropres,
      categorie: donnees.categorie?._links?.self?.href || donnees.categorie
    };

    console.log("Envoi des données au serveur :", medicamentAEnvoyer);

    if (medicamentAEditer.value) {
      const urlEdition = medicamentAEditer.value._links.self.href;
      await axios.put(urlEdition, medicamentAEnvoyer);
      afficherNotification("Médicament mis à jour", "success");
    } else {
      await axios.post(`${API_URL}/medicaments`, medicamentAEnvoyer);
      afficherNotification("Médicament ajouté", "success");
    }

    dialogueOuvert.value = false;
    await chargerPharmacie(); 
  } catch (e) {
    console.error("Détail de l'erreur 400 :", e.response?.data);
    const messageErreur = e.response?.data?.message || "Erreur de validation (400)";
    afficherNotification(messageErreur, "error");
  }
};

const declencherApprovisionnement = async () => {
  try {
    afficherNotification("Traitement de l'approvisionnement...", "warning");
    await axios.post(`${API_URL}/approvisionnement/declencher`);
    afficherNotification("Emails envoyés aux fournisseurs !", "success");
  } catch (e) {
    afficherNotification("Échec du service d'approvisionnement", "error");
  }
};

const ouvrirFormulaire = (med = null) => {
  medicamentAEditer.value = med;
  dialogueOuvert.value = true;
};

const afficherNotification = (msg, col) => {
  snackbar.value = { visible: true, message: msg, couleur: col };
};

const restaurerMedicament = async (med) => {
  try {
    await axios.patch(med._links.self.href, { indisponible: false });
    afficherNotification("Médicament restauré avec succès", "success");
    await chargerPharmacie();
  } catch (e) {
    afficherNotification("Erreur lors de la restauration", "error");
  }
};

const medicamentsFiltres = computed(() => {
  if (!medicaments.value) return [];
  
  const termeRecherche = (recherche.value || "").toLowerCase();
  
  let listeFiltree = medicaments.value.filter(m => {
    const nomProduit = m.nom ? m.nom.toLowerCase() : "";
    const correspondTexte = nomProduit.includes(termeRecherche);
    const correspondStatut = !m.indisponible;
    return correspondTexte && correspondStatut;
  });

  return listeFiltree.sort((a, b) => {
    switch (ordreTri.value) {
      case 'plus-recent':
        return b.reference - a.reference; 
        
      case 'plus-ancien':
        return a.reference - b.reference;
        
      case 'alpha-asc':
        return (a.nom || "").localeCompare(b.nom || "", 'fr');
        
      case 'alpha-desc':
        return (b.nom || "").localeCompare(a.nom || "", 'fr');
        
      case 'stock-asc':
        return a.unitesEnStock - b.unitesEnStock;
        
      case 'stock-desc':
        return b.unitesEnStock - a.unitesEnStock;
        
      default:
        return 0;
    }
  });
});

const medicamentsArchives = computed(() => {
  if (!medicaments.value) return [];
  return medicaments.value.filter(m => m.indisponible === true);
});



onMounted(() => {
  chargerPharmacie(true);
});
</script>

<template>
  <v-app>
    <SplashScreen v-if="chargementInitial" :progression="progression" />

    <template v-else>
      <v-app-bar color="teal-darken-4" elevation="3">
        <template #prepend><v-icon icon="mdi-pharmacy" class="ml-2"></v-icon></template>
        <v-app-bar-title class="font-weight-bold text-uppercase">Gestion Pharmacie</v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn color="orange-accent-2" variant="elevated" class="mr-2" @click="declencherApprovisionnement">
          <template #prepend><v-icon icon="mdi-email-fast"></v-icon></template>
          RÉAPPROVISIONNER
        </v-btn>
      </v-app-bar>

      <v-main class="bg-grey-lighten-4">
        <v-container>
          <v-row class="mt-2 mb-4" align="center">
            <v-col cols="12" md="5" lg="6">
              <v-text-field v-model="recherche" label="Rechercher un médicament..." prepend-inner-icon="mdi-magnify" variant="solo" hide-details clearable rounded="lg"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="4">
              <v-select v-model="ordreTri" :items="optionsDeTri" item-title="titre" item-value="valeur" label="Trier par :" variant="solo" hide-details rounded="lg" prepend-inner-icon="mdi-sort-variant"></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="3" lg="2" class="text-right">
              <v-btn color="blue-grey-darken-2" variant="tonal" prepend-icon="mdi-archive" size="large" rounded="lg" block @click="dialogueArchivesOuvert = true">
                ARCHIVES
              </v-btn>
            </v-col>
          </v-row>

          <div v-if="chargement" class="text-center pa-10">
            <v-progress-circular indeterminate color="teal" size="64"></v-progress-circular>
            <div class="mt-4 text-body-1 text-teal-darken-3">Actualisation...</div>
          </div>
          <div v-else-if="medicamentsFiltres.length > 0">
            <MedicamentItem 
              v-for="m in medicamentsFiltres" :key="m.reference" :medicament="m"
              @incrementer="modifierStock(m, 1)" @decrementer="modifierStock(m, -1)"
              @supprimer="supprimerMedicament(m)" @modifier="ouvrirFormulaire(m)"
            />
          </div>
          <v-alert v-else type="info" variant="tonal" class="mt-4" rounded="lg">Aucun résultat.</v-alert>
        </v-container>
        
        <v-btn color="teal-darken-2" elevation="8" rounded="pill" size="x-large" position="fixed" location="bottom right" class="ma-6 mb-8 font-weight-bold" style="z-index: 1000;" @click="ouvrirFormulaire()">
          <v-icon start icon="mdi-plus-thick"></v-icon> NOUVEAU
        </v-btn>

        <SocialSignature />
      </v-main>

      <ArchivesDialog 
        :ouvert="dialogueArchivesOuvert" 
        :medicaments="medicamentsArchives" 
        @fermer="dialogueArchivesOuvert = false" 
        @restaurer="restaurerMedicament" 
      />

      <MedicamentFormulaire 
        :ouvert="dialogueOuvert" 
        :medicament-edite="medicamentAEditer" 
        @fermer="dialogueOuvert = false" 
        @sauvegarder="enregistrerMedicament" 
      />
    </template>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.couleur" elevation="10" rounded="pill">
      <div class="text-center font-weight-bold">{{ snackbar.message }}</div>
    </v-snackbar>
  </v-app>
</template>