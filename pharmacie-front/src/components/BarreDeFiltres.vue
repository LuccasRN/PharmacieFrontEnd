<script setup>
// Définition des propriétés reçues du parent (App.vue)
defineProps({
  recherche: String,
  ordreTri: String,
  optionsDeTri: Array
});

// Définition des événements pour mettre à jour le parent
const emit = defineEmits([
  'update:recherche', 
  'update:ordreTri', 
  'ouvrir-archives'
]);
</script>

<template>
  <v-row class="mt-2 mb-4" align="center">
    <v-col cols="12" md="5" lg="6">
      <v-text-field 
        :model-value="recherche" 
        @update:model-value="emit('update:recherche', $event)"
        label="Rechercher un médicament..." 
        prepend-inner-icon="mdi-magnify" 
        variant="solo" 
        hide-details 
        clearable 
        rounded="lg"
      ></v-text-field>
    </v-col>

    <v-col cols="12" sm="6" md="4" lg="4">
      <v-select
        :model-value="ordreTri"
        @update:model-value="emit('update:ordreTri', $event)"
        :items="optionsDeTri"
        item-title="titre"
        item-value="valeur"
        label="Trier par :"
        variant="solo"
        hide-details
        rounded="lg"
        prepend-inner-icon="mdi-sort-variant"
      ></v-select>
    </v-col>
    
    <v-col cols="12" sm="6" md="3" lg="2" class="text-right">
      <v-btn 
        color="blue-grey-darken-2" 
        variant="tonal" 
        prepend-icon="mdi-archive"
        size="large"
        rounded="lg"
        block
        @click="emit('ouvrir-archives')"
      >
        ARCHIVES
      </v-btn>
    </v-col>
  </v-row>
</template>