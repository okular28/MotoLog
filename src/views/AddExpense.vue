<template>
  <div>
    <div v-if="!activeVehicle" class="text-center py-5">
      <h6 class="text-muted">Aby dodać wydatek, wybierz pojazd.</h6>
      <button class="btn btn-primary-custom mt-3" @click="router.push('/vehicles')">Przejdź do pojazdów</button>
    </div>
    <div v-else>
      <h5 class="fw-bold text-center mb-4">Nowy wydatek</h5>
      <form @submit.prevent="saveExpense">
        <div class="bg-white p-3 rounded-4 mb-4 text-center border">
          <div class="text-muted small mb-2">KWOTA CAŁKOWITA (PLN)</div>
          <input type="number" step="0.01" class="form-control text-center border-0 fw-bold fs-2 p-0" placeholder="0.00 PLN" v-model="newExpense.amount" @input="calcFuel('amount')" required>
          <hr class="w-50 mx-auto mt-0">
        </div>

        <div class="mb-4">
          <div class="text-muted small mb-2 text-uppercase" style="font-size: 0.7rem;">Kategoria</div>
          <div class="d-flex justify-content-between">
            <div class="category-btn" :class="{ active: newExpense.category === 'paliwo' }" @click="newExpense.category = 'paliwo'">
              <i class="fa-solid fa-gas-pump"></i><br>Paliwo
            </div>
            <div class="category-btn" :class="{ active: newExpense.category === 'serwis' }" @click="newExpense.category = 'serwis'">
              <i class="fa-solid fa-wrench"></i><br>Serwis
            </div>
            <div class="category-btn" :class="{ active: newExpense.category === 'inne' }" @click="newExpense.category = 'inne'">
              <i class="fa-solid fa-ellipsis"></i><br>Inne
            </div>
          </div>
        </div>

        <div v-if="newExpense.category === 'paliwo'" class="row g-2 mb-3">
          <div class="col-6">
            <label class="small text-muted mb-1">Cena za litr (zł)</label>
            <input type="number" step="0.01" class="form-control form-control-custom" placeholder="np. 6.50" v-model="newExpense.pricePerLiter" @input="calcFuel('price')">
          </div>
          <div class="col-6">
            <label class="small text-muted mb-1">Ilość paliwa (L)</label>
            <input type="number" step="0.01" class="form-control form-control-custom" placeholder="np. 40.5" v-model="newExpense.liters" @input="calcFuel('liters')">
          </div>
        </div>

        <div v-if="newExpense.category === 'serwis' || newExpense.category === 'inne'" class="mb-3">
          <label class="small text-muted mb-1">Opis (opcjonalnie)</label>
          <input type="text" class="form-control form-control-custom" placeholder="Krótki opis wydatku" v-model="newExpense.description">
        </div>

        <div class="row g-2 mb-4 mt-1">
          <div class="col-6">
            <div class="form-control-custom bg-white d-flex align-items-center">
              <i class="fa-solid fa-gauge text-muted me-2"></i>
              <input type="number" class="form-control border-0 p-0" placeholder="Przebieg" v-model="newExpense.mileage" required>
            </div>
          </div>
          <div class="col-6">
            <div class="form-control-custom bg-white d-flex align-items-center">
              <input type="date" class="form-control border-0 p-0" v-model="newExpense.date" required>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary-custom w-100">Zapisz wydatek</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { activeVehicle, expenses, activeVehicleId, getTodayStr } from '../store.js';

const router = useRouter();

const newExpense = reactive({ 
  amount: '', category: 'paliwo', mileage: '', date: getTodayStr(),
  description: '', pricePerLiter: '', liters: ''
});

const calcFuel = (changedField) => {
  let a = parseFloat(newExpense.amount);
  let p = parseFloat(newExpense.pricePerLiter);
  let l = parseFloat(newExpense.liters);

  if (changedField === 'amount') {
    if (!isNaN(a) && !isNaN(p) && p > 0) newExpense.liters = (a / p).toFixed(2);
    else if (!isNaN(a) && !isNaN(l) && l > 0) newExpense.pricePerLiter = (a / l).toFixed(2);
  } else if (changedField === 'price') {
    if (!isNaN(p) && !isNaN(l) && l > 0) newExpense.amount = (p * l).toFixed(2);
    else if (!isNaN(p) && !isNaN(a) && p > 0) newExpense.liters = (a / p).toFixed(2);
  } else if (changedField === 'liters') {
    if (!isNaN(l) && !isNaN(p) && p > 0) newExpense.amount = (l * p).toFixed(2);
    else if (!isNaN(l) && !isNaN(a) && l > 0) newExpense.pricePerLiter = (a / l).toFixed(2);
  }
};

const saveExpense = () => {
  let iconClass = 'fa-solid fa-ellipsis';
  if(newExpense.category === 'paliwo') iconClass = 'fa-solid fa-gas-pump';
  if(newExpense.category === 'serwis') iconClass = 'fa-solid fa-wrench';

  if (activeVehicle.value && newExpense.mileage > activeVehicle.value.mileage) {
    activeVehicle.value.mileage = newExpense.mileage;
  }

  expenses.value.push({
    id: Date.now(),
    vehicleId: activeVehicleId.value,
    title: newExpense.category.charAt(0).toUpperCase() + newExpense.category.slice(1),
    date: newExpense.date,
    amount: `- ${parseFloat(newExpense.amount).toFixed(2)}`,
    icon: iconClass,
    mileage: newExpense.mileage,
    description: newExpense.category !== 'paliwo' ? newExpense.description : null,
    liters: newExpense.category === 'paliwo' ? newExpense.liters : null,
    pricePerLiter: newExpense.category === 'paliwo' ? newExpense.pricePerLiter : null
  });

  if(navigator.vibrate) navigator.vibrate(100);

  newExpense.amount = ''; newExpense.description = ''; newExpense.pricePerLiter = ''; newExpense.liters = '';
  router.push('/history');
};
</script>
