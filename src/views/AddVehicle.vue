<template>
  <div>
    <h5 class="fw-bold text-center mb-4">Dodaj nowy pojazd</h5>
    <form @submit.prevent="saveVehicle">
      <div class="mb-3">
        <input type="text" class="form-control form-control-custom" v-model="newVehicle.make" placeholder="Marka (np. Ford)" required>
      </div>
      <div class="mb-3">
        <input type="text" class="form-control form-control-custom" v-model="newVehicle.model" placeholder="Model (np. Focus)" required>
      </div>
      <div class="mb-3">
        <input type="number" class="form-control form-control-custom" v-model="newVehicle.year" placeholder="Rok produkcji" min="1899" :max="currentYear" required>
      </div>
      <div class="mb-4">
        <input type="number" class="form-control form-control-custom" v-model="newVehicle.mileage" placeholder="Aktualny przebieg (km)" min="0" required>
      </div>
      <button type="submit" class="btn btn-primary-custom w-100 mb-2" :disabled="isLoading">
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Zapisz pojazd
      </button>
      <button type="button" class="btn btn-light w-100" @click="router.push('/vehicles')">Anuluj</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { activeVehicleId, getCurrentYear, currentUser, loadData } from '../store.js';
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const router = useRouter();
const currentYear = getCurrentYear();
const newVehicle = reactive({ make: '', model: '', year: '', mileage: '' });
const isLoading = ref(false);

const saveVehicle = async () => {
  if (newVehicle.year < 1899 || newVehicle.year > currentYear) {
    alert(`Rok produkcji musi być między 1899 a ${currentYear}.`);
    return;
  }
  if (newVehicle.mileage < 0) {
    alert('Przebieg nie może być ujemny.');
    return;
  }
  if (!currentUser.value) {
    alert('Zaloguj się, aby dodać pojazd.');
    return;
  }

  isLoading.value = true;
  
  try {
    const docRef = await addDoc(collection(db, "vehicles"), {
      userId: currentUser.value.uid,
      make: newVehicle.make,
      model: newVehicle.model,
      year: parseInt(newVehicle.year),
      mileage: parseInt(newVehicle.mileage),
      registration: '',
      vin: '',
      insuranceCompany: '',
      insuranceDate: null,
      inspectionDate: null,
      notes: '',
      createdAt: serverTimestamp()
    });
    
    activeVehicleId.value = docRef.id;
    await loadData(); // Pobiera najnowsze dane (w tym nowy pojazd) z Firestore
    router.push('/vehicles');
  } catch (error) {
    console.error("Błąd podczas zapisywania pojazdu:", error);
    alert('Wystąpił błąd podczas dodawania pojazdu.');
  } finally {
    isLoading.value = false;
  }
};
</script>
