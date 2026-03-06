<script setup>
defineProps({
  progression: {
    type: Number,
    required: true
  }
});
</script>

<template>
  <v-main class="bg-teal-darken-4 d-flex align-center justify-center">
    <v-container class="text-center">
      <v-icon icon="mdi-pharmacy" size="100" color="orange-accent-2" class="mb-6"></v-icon>
      <h1 class="text-h3 font-weight-bold text-white mb-2 text-uppercase">Pharmacie ISIS</h1>
      <p class="text-teal-lighten-4 mb-10 text-h6">Connexion à la base de données...</p>

      <v-row justify="center">
        <v-col cols="10" sm="6" md="4">
          <v-progress-linear
            :model-value="progression"
            color="orange-accent-2"
            height="8"
            rounded="pill"
            striped
          ></v-progress-linear>
          <div class="text-white mt-2 font-weight-bold">{{ progression }}%</div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>