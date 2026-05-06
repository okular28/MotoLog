<template>
  <div>
    <div v-if="!activeVehicle" class="text-center py-5">
      <h6 class="text-muted">Proszę wybrać pojazd w zakładce Pojazdy.</h6>
      <button class="btn btn-primary-custom mt-3" @click="router.push('/vehicles')">Przejdź do pojazdów</button>
    </div>
    <div v-else>
      <h5 class="fw-bold text-center mb-4">Szczegóły pojazdu</h5>
      <form @submit.prevent="updateVehicleDetails">
        
        <!-- Podstawowe -->
        <h6 class="fw-bold text-muted small text-uppercase mb-2 ms-1">Dane podstawowe</h6>
        <div class="bg-white p-3 rounded-4 shadow-sm mb-4">
          <div class="mb-3">
            <label class="small text-muted mb-1">Numer rejestracyjny</label>
            <input type="text" class="form-control form-control-custom" v-model="activeVehicle.registration" placeholder="np. WX 12345">
          </div>
          <div>
            <label class="small text-muted mb-1">Numer VIN</label>
            <input type="text" class="form-control form-control-custom text-uppercase" v-model="activeVehicle.vin" placeholder="17 znaków VIN">
          </div>
        </div>

        <!-- Ważne daty i ubezpieczenie -->
        <h6 class="fw-bold text-muted small text-uppercase mb-2 ms-1">Ważne daty i polisy</h6>
        <div class="bg-white p-3 rounded-4 shadow-sm mb-4">
          <div class="mb-3">
            <label class="small text-muted mb-1">Przegląd techniczny do:</label>
            <input type="date" class="form-control form-control-custom" v-model="activeVehicle.inspectionDate">
          </div>
          <hr class="text-muted">
          <div class="mb-3">
            <label class="small text-muted mb-1">Ubezpieczyciel (np. PZU, Warta)</label>
            <input type="text" class="form-control form-control-custom" v-model="activeVehicle.insuranceCompany" placeholder="Nazwa ubezpieczalni">
          </div>
          <div>
            <label class="small text-muted mb-1">Ubezpieczenie (OC/AC) do:</label>
            <input type="date" class="form-control form-control-custom" v-model="activeVehicle.insuranceDate">
          </div>
        </div>

        <!-- Notatki -->
        <h6 class="fw-bold text-muted small text-uppercase mb-2 ms-1">Notatki techniczne</h6>
        <div class="bg-white p-3 rounded-4 shadow-sm mb-4">
          <textarea class="form-control form-control-custom" v-model="activeVehicle.notes" rows="4" placeholder="np. Rozmiar opon zimowych: 205/55 R16, rodzaj oleju: 5W-30..."></textarea>
        </div>

        <button type="submit" class="btn btn-primary-custom w-100 mb-2" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Zapisz zmiany
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { activeVehicle } from '../store.js';
import { db } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';

const router = useRouter();
const isLoading = ref(false);

const updateVehicleDetails = async () => {
  if (!activeVehicle.value || !activeVehicle.value.id) return;

  // Walidacja VIN (jeśli podano)
  if (activeVehicle.value.vin && activeVehicle.value.vin.trim().length !== 17) {
    alert('Numer VIN musi mieć dokładnie 17 znaków.');
    return;
  }

  isLoading.value = true;
  try {
    const vRef = doc(db, "vehicles", activeVehicle.value.id);
    await updateDoc(vRef, {
      registration: activeVehicle.value.registration || '',
      vin: (activeVehicle.value.vin || '').toUpperCase().trim(),
      inspectionDate: activeVehicle.value.inspectionDate || null,
      insuranceCompany: activeVehicle.value.insuranceCompany || '',
      insuranceDate: activeVehicle.value.insuranceDate || null,
      notes: activeVehicle.value.notes || ''
    });

    if (navigator.vibrate) navigator.vibrate(100);
    alert('Szczegóły pojazdu zostały zapisane pomyślnie!');
  } catch (error) {
    console.error("Błąd podczas zapisywania szczegółów pojazdu:", error);
    alert("Wystąpił błąd podczas zapisywania zmian.");
  } finally {
    isLoading.value = false;
  }
};
</script>
