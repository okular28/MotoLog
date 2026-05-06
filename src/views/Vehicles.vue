<template>
  <div>
    <h5 class="fw-bold mb-3">Moje pojazdy</h5>
    
    <div v-if="isDataLoading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
      <p class="text-muted mt-2 small">Pobieranie Twoich pojazdów...</p>
    </div>

    <div v-else-if="vehicles.length === 0" class="text-center py-5">
      <i class="fa-solid fa-car-burst text-muted mb-3" style="font-size: 3rem;"></i>
      <h6 class="text-muted">Nie masz jeszcze żadnych pojazdów.</h6>
    </div>

    <div v-else class="expense-list mb-4">
      <div 
        class="vehicle-item d-flex align-items-center justify-content-between p-3 mb-2 border rounded-4" 
        v-for="v in vehicles" 
        :key="v.id" 
        :class="{'active-vehicle': activeVehicleId === v.id}"
        style="cursor: pointer;"
        @click="selectVehicle(v.id)">
        <div class="d-flex align-items-center flex-grow-1">
          <div class="expense-icon me-3"><i class="fa-solid fa-car-side"></i></div>
          <div>
            <div class="fw-bold">{{ v.make }} {{ v.model }}</div>
            <div class="text-muted small">Rocznik: {{ v.year }} | Przebieg: {{ v.mileage }} km</div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3">
          <i class="fa-solid fa-trash-can text-danger fs-5" style="cursor: pointer; padding: 5px;" @click.stop="deleteVehicle(v.id, `${v.make} ${v.model}`)"></i>
          <i class="fa-solid fa-chevron-right text-muted"></i>
        </div>
      </div>
    </div>

    <button class="btn btn-primary-custom w-100" @click="router.push('/add-vehicle')">
      <i class="fa-solid fa-plus me-2"></i> Dodaj pojazd
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { vehicles, activeVehicleId, loadData, isDataLoading } from '../store.js';
import { db } from '../firebase.js';
import { doc, deleteDoc } from 'firebase/firestore';

const router = useRouter();

const selectVehicle = (id) => {
  activeVehicleId.value = id;
  router.push('/history');
};

const deleteVehicle = async (id, name) => {
  if (!confirm(`Czy na pewno chcesz usunąć pojazd ${name}? Usunie to również wszystkie przypisane do niego dane z bazy.`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, "vehicles", id));
    
    // Jeśli usunięto obecnie aktywny pojazd, resetujemy jego wybór
    if (activeVehicleId.value === id) {
      activeVehicleId.value = null;
    }

    await loadData(); // Pobieramy na nowo listę pojazdów z Firestore

    // Jeśli po usunięciu nadal mamy inne auta, a aktywny jest null, ustawmy pierwsze z brzegu jako aktywne
    if (vehicles.value.length > 0 && !activeVehicleId.value) {
      activeVehicleId.value = vehicles.value[0].id;
    }
  } catch (error) {
    console.error("Błąd podczas usuwania pojazdu:", error);
    alert("Wystąpił błąd podczas usuwania pojazdu.");
  }
};
</script>
