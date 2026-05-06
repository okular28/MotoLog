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
      <button type="submit" class="btn btn-primary-custom w-100 mb-2">Zapisz pojazd</button>
      <button type="button" class="btn btn-light w-100" @click="router.push('/vehicles')">Anuluj</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { vehicles, activeVehicleId, getCurrentYear } from '../store.js';

const router = useRouter();
const currentYear = getCurrentYear();
const newVehicle = reactive({ make: '', model: '', year: '', mileage: '' });

const saveVehicle = () => {
  if (newVehicle.year < 1899 || newVehicle.year > currentYear) {
    alert(`Rok produkcji musi być między 1899 a ${currentYear}.`);
    return;
  }
  if (newVehicle.mileage < 0) {
    alert('Przebieg nie może być ujemny.');
    return;
  }

  const id = Date.now();
  
  vehicles.value.push({ 
    id, 
    ...newVehicle,
    registration: '',
    vin: '',
    insuranceCompany: '',
    insuranceDate: '',
    inspectionDate: '',
    notes: ''
  });
  
  activeVehicleId.value = id;
  router.push('/vehicles');
};
</script>
