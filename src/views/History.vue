<template>
  <div>
    <div v-if="!activeVehicle" class="text-center py-5">
      <h6 class="text-muted">Proszę wybrać pojazd w zakładce Pojazdy.</h6>
    </div>
    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold mb-0">Historia wydatków</h6>
        <i class="fa-solid fa-filter text-muted" style="color: var(--brand-orange) !important;"></i>
      </div>

      <div v-if="activeVehicleExpenses.length === 0" class="text-center text-muted small py-4">
        Brak wydatków dla tego pojazdu.
      </div>

      <div class="expense-list">
        <div class="expense-item align-items-start" v-for="expense in activeVehicleExpenses" :key="expense.id">
          <div class="expense-icon mt-1"><i :class="expense.icon"></i></div>
          <div class="flex-grow-1">
            <div class="fw-bold">{{ expense.title }}</div>
            <div class="text-muted mb-1" style="font-size: 0.75rem;">{{ expense.date }} | {{ expense.mileage }} km</div>
            <div v-if="expense.description" class="text-muted fst-italic" style="font-size: 0.8rem;">
              {{ expense.description }}
            </div>
            <div v-if="expense.liters" class="text-muted" style="font-size: 0.8rem;">
              {{ expense.liters }} L ({{ expense.pricePerLiter }} zł/L)
            </div>
          </div>
          <div class="fw-bold text-nowrap ms-2">{{ expense.amount }} zł</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { activeVehicle, activeVehicleExpenses } from '../store.js';
</script>
