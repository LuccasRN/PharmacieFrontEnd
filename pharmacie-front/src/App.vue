<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import MedicamentItem from './components/MedicamentItem.vue';
import MedicamentFormulaire from './components/MedicamentFormulaire.vue';

const API_URL = 'https://pharmaciebackend.onrender.com/api';

const medicaments = ref([]);
const recherche = ref('');
const chargement = ref(false);
const dialogueOuvert = ref(false);
const medicamentAEditer = ref(null);
const snackbar = ref({ visible: false, message: '', couleur: '' });

const chargerPharmacie = async () => {
  chargement.value = true;
  try {
    const reponse = await axios.get(`${API_URL}/medicaments?size=200`);
    
    if (reponse.data._embedded && reponse.data._embedded.medicaments) {
      medicaments.value = reponse.data._embedded.medicaments;
    }
  } catch (erreur) {
    console.error("Error cargando:", erreur);
    afficherNotification("Erreur de chargement", "error");
  } finally {
    chargement.value = false;
  }
};

const modifierStock = async (med, delta) => {
  const nuevaQte = med.unitesEnStock + delta;
  if (nuevaQte < 0) return;

  const originalQte = med.unitesEnStock;
  med.unitesEnStock = nuevaQte;

  try {
    await axios.patch(med._links.self.href, { 
      unitesEnStock: nuevaQte 
    });
    await chargerPharmacie(); 
  } catch (e) {
    med.unitesEnStock = originalQte;
    afficherNotification("Erreur serveur", "error");
  }
};

const supprimerMedicament = async (id) => {
  if (confirm("Voulez-vous supprimer définitivement ce médicament ?")) {
    try {
      await axios.delete(`${API_URL}/medicaments/${id}`);
      afficherNotification("Médicament supprimé avec succès", "info");
      await chargerPharmacie();
    } catch (e) {
      if (e.response && e.response.status === 409) {
        afficherNotification("Impossible de supprimer : ce médicament est lié à des commandes existantes.", "error");
      } else {
        afficherNotification("Erreur lors de la suppression", "error");
      }
    }
  }
};

const enregistrerMedicament = async (donnees) => {
  try {
    const { _links, reference, ...datosLimpios } = donnees;

    const medicamentoParaEnviar = {
      ...datosLimpios,
      categorie: donnees.categorie?._links?.self?.href || donnees.categorie
    };

    console.log("Enviando datos al servidor:", medicamentoParaEnviar);

    if (medicamentAEditer.value) {
      const urlEdicion = medicamentAEditer.value._links.self.href;
      await axios.put(urlEdicion, medicamentoParaEnviar);
      afficherNotification("Médicament mis à jour", "success");
    } else {
      await axios.post(`${API_URL}/medicaments`, medicamentoParaEnviar);
      afficherNotification("Médicament ajouté", "success");
    }

    dialogueOuvert.value = false;
    await chargerPharmacie(); 
  } catch (e) {
    console.error("Detalle del error 400:", e.response?.data);
    const mensajeError = e.response?.data?.message || "Erreur de validation (400)";
    afficherNotification(mensajeError, "error");
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

const abrirFormulario = (med = null) => {
  medicamentAEditer.value = med;
  dialogueOuvert.value = true;
};

const afficherNotification = (msg, col) => {
  snackbar.value = { visible: true, message: msg, couleur: col };
};

const medicamentsFiltres = computed(() => {
  if (!medicaments.value) return [];
  return medicaments.value.filter(m => {
    const nombre = m.nom ? m.nom.toLowerCase() : "";
    return nombre.includes(recherche.value.toLowerCase());
  });
});

onMounted(chargerPharmacie);
</script>

<template>
  <v-app>
    <v-app-bar color="teal-darken-4" elevation="3">
      <template #prepend>
        <v-icon icon="mdi-pharmacy" class="ml-2"></v-icon>
      </template>
      <v-app-bar-title class="font-weight-bold text-uppercase">
        Gestion Pharmacie ISIS
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn color="orange-accent-2" variant="elevated" class="mr-2" @click="declencherApprovisionnement">
        <template #prepend>
          <v-icon icon="mdi-email-fast"></v-icon>
        </template>
        RÉAPPROVISIONNER
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container>
        <v-row class="mt-2 mb-4">
          <v-col cols="12">
            <v-text-field v-model="recherche" label="Rechercher un médicament..." prepend-inner-icon="mdi-magnify" variant="solo" hide-details clearable rounded="lg"></v-text-field>
          </v-col>
        </v-row>

        <div v-if="chargement" class="text-center pa-10">
          <v-progress-circular indeterminate color="teal" size="64"></v-progress-circular>
          <div class="mt-4 text-body-1 text-teal-darken-3">Chargement...</div>
        </div>

        <div v-else-if="medicamentsFiltres.length > 0">
          <MedicamentItem 
            v-for="m in medicamentsFiltres" 
            :key="m.reference" 
            :medicament="m"
            @incrementer="modifierStock(m, 1)"
            @decrementer="modifierStock(m, -1)"
            @supprimer="supprimerMedicament(m.reference)"
            @modifier="abrirFormulario(m)"
          />
        </div>

        <v-alert v-else type="info" variant="tonal" class="mt-4" rounded="lg">
          Aucun résultat.
        </v-alert>
    
      </v-container>
      <v-btn 
        color="teal-darken-2" 
        elevation="8" 
        rounded="pill"
        size="x-large"
        position="fixed"
        location="bottom right"
        class="ma-6 mb-8 font-weight-bold"
        style="z-index: 1000;"
        @click="abrirFormulario()"
      >
        <v-icon start icon="mdi-plus-thick"></v-icon>
        NOUVEAU
      </v-btn>
    </v-main>

    <MedicamentFormulaire :ouvert="dialogueOuvert" :medicament-edite="medicamentAEditer" @fermer="dialogueOuvert = false" @sauvegarder="enregistrerMedicament" />
    <v-snackbar v-model="snackbar.visible" :color="snackbar.couleur" elevation="10" rounded="pill">
      <div class="text-center font-weight-bold">{{ snackbar.message }}</div>
    </v-snackbar>
  </v-app>
</template>