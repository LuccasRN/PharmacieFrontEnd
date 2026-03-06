// src/services/apiService.js
import axios from 'axios';

const API_URL = 'https://pharmaciebackend.onrender.com/api';

export default {
  // --- MÉDICAMENTS ---
  getMedicaments() {
    return axios.get(`${API_URL}/medicaments?size=200`);
  },
  
  ajouterMedicament(donnees) {
    return axios.post(`${API_URL}/medicaments`, donnees);
  },
  
  modifierMedicament(url, donnees) {
    return axios.put(url, donnees);
  },

  modifierStatut(url, donnees) {
    // Utilisé pour le stock et l'archivage (soft delete)
    return axios.patch(url, donnees);
  },

  // --- APPROVISIONNEMENT ---
  declencherApprovisionnement() {
    return axios.post(`${API_URL}/approvisionnement/declencher`);
  }
};