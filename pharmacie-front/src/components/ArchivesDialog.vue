<script setup>
defineProps({
  ouvert: Boolean,
  medicaments: Array
});

const emit = defineEmits(['fermer', 'restaurer']);
</script>

<template>
  <v-dialog :model-value="ouvert" max-width="600px" scrollable persistent>
    <v-card rounded="lg">
      <v-toolbar color="blue-grey-darken-3" flat text-white>
        <template #prepend><v-icon icon="mdi-archive" class="ms-3"></v-icon></template>
        <v-toolbar-title>Médicaments Archivés</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="pa-0" style="max-height: 400px;">
        <v-list lines="two" v-if="medicaments.length > 0">
          <v-list-item v-for="m in medicaments" :key="m.reference">
            <template #prepend>
              <v-avatar rounded="lg" color="grey-lighten-2">
                <v-img :src="m.imageURL || 'https://via.placeholder.com/80'"></v-img>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold">{{ m.nom }}</v-list-item-title>
            <v-list-item-subtitle>Stock conservé : {{ m.unitesEnStock }}</v-list-item-subtitle>
            <template #append>
              <v-btn color="success" variant="tonal" size="small" prepend-icon="mdi-restore" @click="emit('restaurer', m)">
                Restaurer
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-alert v-else type="info" variant="tonal" class="ma-4">
          La corbeille est vide. Aucun médicament archivé.
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="emit('fermer')">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>