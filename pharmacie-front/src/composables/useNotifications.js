import { ref } from 'vue';

export function useNotifications() {
  const snackbar = ref({ visible: false, message: '', couleur: '' });

  const afficherNotification = (msg, col) => {
    snackbar.value = { visible: true, message: msg, couleur: col };
  };

  return {
    snackbar,
    afficherNotification
  };
}