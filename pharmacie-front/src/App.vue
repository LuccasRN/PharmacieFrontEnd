<script setup>
import { ref, onMounted, computed } from 'vue';
import api from './services/apiService'; 

import MedicamentItem from './components/MedicamentItem.vue';
import MedicamentFormulaire from './components/MedicamentFormulaire.vue';
import SplashScreen from './components/SplashScreen.vue';
import ArchivesDialog from './components/ArchivesDialog.vue';
import SocialSignature from './components/SocialSignature.vue';
import BarreDeFiltres from './components/BarreDeFiltres.vue';

import { useNotifications } from './composables/useNotifications';
import { useMedicaments } from './composables/useMedicaments';

const { snackbar, afficherNotification } = useNotifications();

const { 
  medicaments, chargement, chargerPharmacie, 
  modifierStock, archiverMedicament, restaurerMedicament, enregistrerMedicament 
} = useMedicaments(afficherNotification);

const recherche = ref('');
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

const initialiserApp = async () => {
  chargementInitial.value = true;
  progression.value = 0;
  
  const intervalle = setInterval(() => {
    if (progression.value < 85) progression.value += 15;
  }, 200);

  await chargerPharmacie();
  
  progression.value = 100;
  clearInterval(intervalle);
  setTimeout(() => { chargementInitial.value = false; }, 600);
};

const declencherApprovisionnement = async () => {
  try {
    afficherNotification("Traitement de l'approvisionnement...", "warning");
    await api.declencherApprovisionnement();
    afficherNotification("Emails envoyés aux fournisseurs !", "success");
  } catch (e) {
    afficherNotification("Échec du service d'approvisionnement", "error");
  }
};

const ouvrirFormulaire = (med = null) => {
  medicamentAEditer.value = med;
  dialogueOuvert.value = true;
};

const gererSauvegarde = (donnees) => {
  enregistrerMedicament(donnees, medicamentAEditer.value, () => {
    dialogueOuvert.value = false;
  });
};

const medicamentsFiltres = computed(() => {
  if (!medicaments.value) return [];
  
  const termeRecherche = (recherche.value || "").toLowerCase();
  
  let listeFiltree = medicaments.value.filter(m => {
    const nomProduit = m.nom ? m.nom.toLowerCase() : "";
    return nomProduit.includes(termeRecherche) && !m.indisponible;
  });

  return listeFiltree.sort((a, b) => {
    switch (ordreTri.value) {
      case 'plus-recent': return b.reference - a.reference; 
      case 'plus-ancien': return a.reference - b.reference;
      case 'alpha-asc': return (a.nom || "").localeCompare(b.nom || "", 'fr');
      case 'alpha-desc': return (b.nom || "").localeCompare(a.nom || "", 'fr');
      case 'stock-asc': return a.unitesEnStock - b.unitesEnStock;
      case 'stock-desc': return b.unitesEnStock - a.unitesEnStock;
      default: return 0;
    }
  });
});

const medicamentsArchives = computed(() => {
  if (!medicaments.value) return [];
  return medicaments.value.filter(m => m.indisponible === true);
});

onMounted(initialiserApp);
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
          
          <BarreDeFiltres 
            v-model:recherche="recherche"
            v-model:ordreTri="ordreTri"
            :options-de-tri="optionsDeTri"
            @ouvrir-archives="dialogueArchivesOuvert = true"
          />

          <div v-if="chargement" class="text-center pa-10">
            <v-progress-circular indeterminate color="teal" size="64"></v-progress-circular>
            <div class="mt-4 text-body-1 text-teal-darken-3">Actualisation...</div>
          </div>
          <div v-else-if="medicamentsFiltres.length > 0">
            <MedicamentItem 
              v-for="m in medicamentsFiltres" :key="m.reference" :medicament="m"
              @incrementer="modifierStock(m, 1)" 
              @decrementer="modifierStock(m, -1)"
              @supprimer="archiverMedicament(m)" @modifier="ouvrirFormulaire(m)"
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
        @sauvegarder="gererSauvegarde" 
      />
    </template>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.couleur" elevation="10" rounded="pill">
      <div class="text-center font-weight-bold">{{ snackbar.message }}</div>
    </v-snackbar>
  </v-app>
</template>