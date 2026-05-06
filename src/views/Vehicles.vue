<template>
  <div>
    <h5 class="fw-bold mb-3">Moje pojazdy</h5>
    
    <div v-if="vehicles.length === 0" class="text-center py-5">
      <i class="fa-solid fa-car-burst text-muted mb-3" style="font-size: 3rem;"></i>
      <h6 class="text-muted">Nie masz jeszcze żadnych pojazdów.</h6>
    </div>

    <div v-else class="expense-list mb-4">
      <div 
        class="vehicle-item" 
        v-for="v in vehicles" 
        :key="v.id" 
        :class="{'active-vehicle': activeVehicleId === v.id}"
        @click="selectVehicle(v.id)">
        <div class="expense-icon"><i class="fa-solid fa-car-side"></i></div>
        <div class="flex-grow-1">
          <div class="fw-bold">{{ v.make }} {{ v.model }}</div>
          <div class="text-muted small">Rocznik: {{ v.year }} | Przebieg: {{ v.mileage }} km</div>
        </div>
        <i class="fa-solid fa-chevron-right text-muted"></i>
      </div>
    </div>

    <button class="btn btn-primary-custom w-100" @click="router.push('/add-vehicle')">
      <i class="fa-solid fa-plus me-2"></i> Dodaj pojazd
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { vehicles, activeVehicleId } from '../store.js';

const router = useRouter();

const selectVehicle = (id) => {
  activeVehicleId.value = id;
  router.push('/history');
};
</script>
