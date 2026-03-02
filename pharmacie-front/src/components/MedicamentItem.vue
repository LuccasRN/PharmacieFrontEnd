<script setup>
import { computed } from 'vue';

const props = defineProps({
  medicament: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['incrementer', 'decrementer', 'supprimer', 'modifier']);

const estEnSousStock = computed(() => {
  return props.medicament.unitesEnStock < props.medicament.niveauDeReappro;
});
</script>

<template>
  <v-card 
    class="mb-4 pa-4 shadow-sm" 
    variant="outlined" 
    :color="estEnSousStock ? 'error' : 'grey-lighten-1'"
    :class="{ 'bg-red-lighten-5': estEnSousStock }"
  >
    <v-row align="center">
      <v-col cols="12" sm="2">
        <v-img 
          :src="medicament.imageURL || 'https://via.placeholder.com/80'" 
          height="80" 
          cover 
          class="rounded bg-grey-lighten-3"
        ></v-img>
      </v-col>
      
      <v-col cols="12" sm="4">
        <div class="text-h6 font-weight-bold text-teal-darken-4">{{ medicament.nom }}</div>
        <div class="text-caption text-grey-darken-1">{{ medicament.quantiteParUnite }}</div>
        <div class="text-caption font-italic">Réf: {{ medicament.reference }}</div>
      </v-col>

      <v-col cols="12" sm="2" class="text-center">
        <div class="text-subtitle-2 text-grey">Stock actuel</div>
        <div class="text-h5" :class="estEnSousStock ? 'text-error font-weight-black' : 'text-primary'">
          {{ medicament.unitesEnStock }}
        </div>
        <v-chip v-if="estEnSousStock" size="x-small" color="error" variant="flat" class="mt-1">
          RÉAPPRO NÉCESSAIRE
        </v-chip>
      </v-col>

      <v-col cols="12" sm="4" class="d-flex justify-end align-center flex-wrap">
        <v-btn-group variant="tonal" class="me-2">
          <v-btn icon="mdi-plus" color="success" @click="emit('incrementer')"></v-btn>
          <v-btn icon="mdi-minus" color="warning" @click="emit('decrementer')"></v-btn>
        </v-btn-group>
        
        <v-btn 
          icon="mdi-pencil" 
          color="info" 
          variant="text" 
          class="me-1" 
          @click="emit('modifier')"
        ></v-btn>
        
        <v-btn 
          icon="mdi-delete" 
          color="error" 
          variant="text" 
          @click="emit('supprimer')"
        ></v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>