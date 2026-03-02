<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps(['ouvert', 'medicamentEdite']);
const emit = defineEmits(['fermer', 'sauvegarder']);


const categories = ref([]);
const chargementCategories = ref(false);

const formulario = ref({
  nom: '',
  quantiteParUnite: '',
  unitesEnStock: 0,
  niveauDeReappro: 0,
  prixUnitaire: 0,
  imageURL: '',
  categorie: null 
});


const chargerCategories = async () => {
  chargementCategories.value = true;
  try {
    const res = await axios.get('https://pharmaciebackend.onrender.com/api/categories');
    categories.value = res.data._embedded.categories.map(cat => ({
      titre: cat.libelle,
      lien: cat._links.self.href 
    }));
  } catch (e) {
    console.error("Erreur lors du chargement des catégories", e);
  } finally {
    chargementCategories.value = false;
  }
};

const reinitialiserFormulaire = () => {
  formulario.value = { 
    nom: '', 
    quantiteParUnite: '', 
    unitesEnStock: 0, 
    niveauDeReappro: 0, 
    prixUnitaire: 0, 
    imageURL: '',
    categorie: null 
  };
};

watch(() => props.medicamentEdite, (nouveau) => {
  if (nouveau) {
    formulario.value = { 
      ...nouveau,
      categorie: nouveau._links?.categorie?.href || null
    };
  } else {
    reinitialiserFormulaire();
  }
}, { immediate: true });

const validerEtSauvegarder = () => {
  if (!formulario.value.nom || !formulario.value.categorie) {
    alert("Le nom et la catégorie sont obligatoires.");
    return;
  }
  emit('sauvegarder', { ...formulario.value });
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
                v-model="formulario.nom" 
                label="Nom du produit*" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="formulario.categorie"
                :items="categories"
                item-title="titre"
                item-value="lien"
                label="Sélectionner une catégorie*"
                variant="outlined"
                density="compact"
                :loading="chargementCategories"
                no-data-text="Aucune catégorie trouvée"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model="formulario.quantiteParUnite" 
                label="Présentation (ex: 30 comprimés)" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model.number="formulario.prixUnitaire" 
                label="Prix (€)" 
                type="number" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model.number="formulario.unitesEnStock" 
                label="Stock initial" 
                type="number" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model.number="formulario.niveauDeReappro" 
                label="Seuil d'alerte réappro" 
                type="number" 
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field 
                v-model="formulario.imageURL" 
                label="URL de la photo" 
                variant="outlined"
                density="compact"
                placeholder="https://..."
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-camera" size="small"></v-icon>
                </template>
              </v-text-field>
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
</template>