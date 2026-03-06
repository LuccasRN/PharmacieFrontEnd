<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps(['ouvert', 'medicamentEdite']);
const emit = defineEmits(['fermer', 'sauvegarder']);

// --- ÉTATS DU FORMULAIRE ---
const categories = ref([]);
const chargementCategories = ref(false);

const formulaire = ref({
  nom: '',
  quantiteParUnite: '',
  unitesEnStock: 0,
  niveauDeReappro: 0,
  prixUnitaire: 0,
  imageURL: '',
  categorie: null 
});

// --- INTÉGRATION API UNSPLASH ---
const dialogueGalerieOuvert = ref(false);
const requeteImage = ref('médicament'); // Recherche par défaut
const resultatsImages = ref([]);
const chargementImages = ref(false);

// Clé API Unsplash (À garder confidentielle en production)
const UNSPLASH_ACCESS_KEY = 'NL8L3xdjfAYDgOQHjpJRUwSFoU-SKk9qoTL_tCZR3wQ'; 

/**
 * Recherche des images via l'API publique d'Unsplash
 */
const rechercherImages = async () => {
  if (!requeteImage.value) return;
  
  chargementImages.value = true;
  try {
    const reponse = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: requeteImage.value,
        per_page: 12, // Nombre d'images à afficher
        orientation: 'landscape' 
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    resultatsImages.value = reponse.data.results;
  } catch (erreur) {
    console.error("Erreur avec l'API Unsplash :", erreur);
    alert("Impossible de charger les images. Vérifiez votre connexion.");
  } finally {
    chargementImages.value = false;
  }
};

/**
 * Sélectionne l'image et ferme la galerie
 */
const selectionnerImage = (url) => {
  formulaire.value.imageURL = url;
  dialogueGalerieOuvert.value = false;
};

// Charge les images Unsplash lors de l'ouverture de la galerie
watch(dialogueGalerieOuvert, (ouvert) => {
  if (ouvert && resultatsImages.value.length === 0) {
    rechercherImages();
  }
});

// --- MÉTHODES DU FORMULAIRE ---

const chargerCategories = async () => {
  chargementCategories.value = true;
  try {
    const reponse = await axios.get('https://pharmaciebackend.onrender.com/api/categories');
    categories.value = reponse.data._embedded.categories.map(cat => ({
      titre: cat.libelle,
      lien: cat._links.self.href 
    }));
  } catch (erreur) {
    console.error("Erreur lors du chargement des catégories :", erreur);
  } finally {
    chargementCategories.value = false;
  }
};

const reinitialiserFormulaire = () => {
  formulaire.value = { 
    nom: '', 
    quantiteParUnite: '', 
    unitesEnStock: 0, 
    niveauDeReappro: 0, 
    prixUnitaire: 0, 
    imageURL: '',
    categorie: null 
  };
};

watch(() => props.medicamentEdite, async (nouveauMedicament) => {
  if (nouveauMedicament) {
    formulaire.value = { 
      ...nouveauMedicament,
      categorie: null 
    };

    if (nouveauMedicament._links?.categorie?.href) {
      try {
        const reponseCategorie = await axios.get(nouveauMedicament._links.categorie.href);
        formulaire.value.categorie = reponseCategorie.data._links.self.href;
      } catch (erreur) {
        console.error("Impossible de résoudre la catégorie du médicament :", erreur);
      }
    }
  } else {
    reinitialiserFormulaire();
  }
}, { immediate: true });

const validerEtSauvegarder = () => {
  if (!formulaire.value.nom || !formulaire.value.categorie) {
    alert("Le nom et la catégorie sont obligatoires.");
    return;
  }
  emit('sauvegarder', { ...formulaire.value });
};

onMounted(chargerCategories);
</script>

<template>
  <v-dialog :model-value="ouvert" max-width="600px" persistent>
    <v-card rounded="lg">
      <v-toolbar color="teal-darken-3" flat text-white>
        <template #prepend>
          <v-icon icon="mdi-pill" class="ms-3"></v-icon>
        </template>
        <v-toolbar-title>
          {{ medicamentEdite ? 'Modifier le médicament' : 'Nouveau médicament' }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pt-4">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field 
                v-model="formulaire.nom" 
                label="Nom du produit*" 
                variant="outlined"
                density="compact"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="formulaire.categorie"
                :items="categories"
                item-title="titre"
                item-value="lien"
                label="Sélectionner une catégorie*"
                variant="outlined"
                density="compact"
                :loading="chargementCategories"
                no-data-text="Aucune catégorie trouvée"
                required
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model="formulaire.quantiteParUnite" 
                label="Présentation (ex: 30 comprimés)" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model.number="formulaire.prixUnitaire" 
                label="Prix (€)" 
                type="number" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model.number="formulaire.unitesEnStock" 
                label="Stock initial" 
                type="number" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model.number="formulaire.niveauDeReappro" 
                label="Seuil d'alerte réappro" 
                type="number" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12" class="d-flex align-center">
              <v-text-field 
                v-model="formulaire.imageURL" 
                label="URL de la photo" 
                variant="outlined"
                density="compact"
                hide-details
                placeholder="https://..."
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-camera" size="small"></v-icon>
                </template>
              </v-text-field>
              
              <v-btn 
                color="teal-darken-2" 
                variant="tonal" 
                class="ms-2" 
                height="40"
                @click="dialogueGalerieOuvert = true"
              >
                <v-icon icon="mdi-image-search" class="me-1"></v-icon>
                GALERIE
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="emit('fermer')">Annuler</v-btn>
        <v-btn 
          color="teal-darken-2" 
          variant="elevated" 
          class="px-6"
          @click="validerEtSauvegarder"
        >
          {{ medicamentEdite ? 'Mettre à jour' : 'Enregistrer' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogueGalerieOuvert" max-width="650px" scrollable>
    <v-card rounded="lg">
      <v-toolbar color="teal-lighten-1" density="compact">
        <v-icon icon="mdi-image-search" class="ms-3 text-white"></v-icon>
        <v-toolbar-title class="text-white text-subtitle-1 font-weight-bold">
          Rechercher une image (Unsplash)
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" color="white" variant="text" @click="dialogueGalerieOuvert = false"></v-btn>
      </v-toolbar>
      
      <v-card-text class="pa-4 bg-grey-lighten-4">
        <v-text-field
          v-model="requeteImage"
          label="Que cherchez-vous ? (ex: pilules, sirop, pharmacie)"
          variant="solo"
          append-inner-icon="mdi-magnify"
          @click:append-inner="rechercherImages"
          @keyup.enter="rechercherImages"
          :loading="chargementImages"
          hide-details
          class="mb-4"
          rounded="lg"
        ></v-text-field>

        <v-row v-if="resultatsImages.length > 0">
          <v-col 
            v-for="img in resultatsImages" 
            :key="img.id" 
            cols="12" sm="4"
          >
            <v-card 
              hover 
              class="border rounded-lg overflow-hidden" 
              @click="selectionnerImage(img.urls.regular)"
            >
              <v-img :src="img.urls.small" height="120" cover>
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular indeterminate color="grey-lighten-1"></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </v-card>
          </v-col>
        </v-row>

        <v-alert v-else-if="!chargementImages" type="info" variant="tonal">
          Aucune image trouvée. Essayez un autre mot-clé.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>