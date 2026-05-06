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
        v-for="v in sortedVehicles" 
        :key="v.id" 
        :class="{'active-vehicle': activeVehicleId === v.id}"
        style="cursor: pointer;"
        @click="selectVehicle(v.id)">
        <div class="d-flex align-items-center flex-grow-1">
          <div class="expense-icon me-3" :style="activeVehicleId === v.id ? 'background-color: var(--brand-orange) !important; color: white !important;' : ''">
            <i class="fa-solid fa-car-side"></i>
          </div>
          <div>
            <div class="fw-bold d-flex align-items-center gap-2">
              {{ v.make }} {{ v.model }}
              <span v-if="activeVehicleId === v.id" class="badge text-white small" style="font-size: 0.65rem; background-color: var(--brand-orange);">Aktywny</span>
            </div>
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

    <!-- Customowe okno potwierdzenia usunięcia pojazdu -->
    <div v-if="vehicleToDelete" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="bg-white p-4 rounded-4 shadow-lg text-center w-100" style="max-width: 400px; z-index: 1050;">
        <div class="text-danger mb-3" style="font-size: 3rem;">
          <i class="fa-solid fa-circle-exclamation animate__animated animate__pulse animate__infinite"></i>
        </div>
        <h5 class="fw-bold mb-2">Czy jesteś pewien?</h5>
        <p class="text-muted small mb-4">Czy na pewno chcesz usunąć pojazd <b>{{ vehicleToDelete.name }}</b>? Stracisz bezpowrotnie wszystkie przypisane do niego wydatki i dane.</p>
        <div class="d-flex gap-2">
          <button class="btn btn-danger flex-grow-1 py-2 rounded-3 fw-bold" @click="confirmDeleteVehicle">Tak, usuń</button>
          <button class="btn btn-secondary-custom flex-grow-1 py-2 rounded-3" @click="vehicleToDelete = null">Anuluj</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { vehicles, activeVehicleId, loadData, isDataLoading } from '../store.js';
import { db } from '../firebase.js';
import { doc, deleteDoc } from 'firebase/firestore';

const router = useRouter();
const vehicleToDelete = ref(null);

const sortedVehicles = computed(() => {
  return [...vehicles.value].sort((a, b) => {
    if (a.id === activeVehicleId.value) return -1;
    if (b.id === activeVehicleId.value) return 1;
    return 0;
  });
});

const selectVehicle = async (id) => {
  if(navigator.vibrate) navigator.vibrate(50);
  activeVehicleId.value = id;
  await loadData(); // Pobiera dane i odświeża stan dla nowego aktywnego auta
};

const deleteVehicle = (id, name) => {
  if(navigator.vibrate) navigator.vibrate(50);
  vehicleToDelete.value = { id, name };
};

const confirmDeleteVehicle = async () => {
  if (!vehicleToDelete.value) return;
  const id = vehicleToDelete.value.id;
  
  try {
    await deleteDoc(doc(db, "vehicles", id));
    
    if (activeVehicleId.value === id) {
      activeVehicleId.value = null;
    }

    vehicleToDelete.value = null;
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    await loadData();

    if (vehicles.value.length > 0 && !activeVehicleId.value) {
      activeVehicleId.value = vehicles.value[0].id;
    }
  } catch (error) {
    console.error("Błąd podczas usuwania pojazdu:", error);
    alert("Wystąpił błąd podczas usuwania pojazdu.");
    vehicleToDelete.value = null;
  }
};
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}
</style>
