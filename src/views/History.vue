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

      <div v-if="isDataLoading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status" style="width: 2.5rem; height: 2.5rem;">
          <span class="visually-hidden">Ładowanie...</span>
        </div>
        <p class="text-muted mt-2 small">Pobieranie historii wydatków...</p>
      </div>

      <div v-else-if="activeVehicleExpenses.length === 0" class="text-center text-muted small py-4">
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
            <div v-if="expense.receiptBase64" class="mt-2">
              <div class="small text-muted mb-1"><i class="fa-solid fa-paperclip"></i> Paragon:</div>
              <img :src="expense.receiptBase64" class="img-thumbnail rounded-3 shadow-sm" style="max-height: 80px; cursor: pointer;" @click="selectedReceipt = expense.receiptBase64">
            </div>
          </div>
          <div class="d-flex flex-column align-items-end justify-content-between gap-2 ms-2">
            <div class="fw-bold text-nowrap">{{ expense.amount }} zł</div>
            <div class="d-flex gap-2">
              <i class="fa-solid fa-pen text-primary fs-6" style="cursor: pointer; padding: 5px;" @click="startEdit(expense)"></i>
              <i class="fa-solid fa-trash-can text-danger fs-6" style="cursor: pointer; padding: 5px;" @click="deleteExpense(expense.id)"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal podglądu pełnego zdjęcia paragonu -->
    <div v-if="selectedReceipt" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" @click="selectedReceipt = null">
      <div class="position-relative bg-white p-2 rounded-4 shadow-lg text-center" @click.stop style="max-width: 90vw; max-height: 90vh;">
        <img :src="selectedReceipt" class="img-fluid rounded-3" style="max-height: 80vh; object-fit: contain;">
        <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; padding:0;" @click="selectedReceipt = null">
          <i class="fa-solid fa-times text-white" style="font-size: 11px;"></i>
        </button>
      </div>
    </div>

    <!-- Modal edycji wydatku -->
    <div v-if="editingExpense" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="bg-white p-4 rounded-4 shadow-lg w-100" style="max-width: 450px; z-index: 1050;">
        <h5 class="fw-bold mb-3">Edytuj wydatek</h5>
        <form @submit.prevent="updateExpense">
          <div class="mb-3">
            <label class="small text-muted mb-1">Kwota (zł)</label>
            <input type="number" step="0.01" class="form-control form-control-custom" v-model="editForm.amount" required>
          </div>
          <div class="mb-3">
            <label class="small text-muted mb-1">Przebieg (km)</label>
            <input type="number" class="form-control form-control-custom" v-model="editForm.mileage" required>
          </div>
          <div class="mb-3">
            <label class="small text-muted mb-1">Data</label>
            <input type="date" class="form-control form-control-custom" v-model="editForm.date" required>
          </div>
          <div class="mb-3" v-if="editingExpense.category !== 'paliwo'">
            <label class="small text-muted mb-1">Opis</label>
            <input type="text" class="form-control form-control-custom" v-model="editForm.description">
          </div>

          <!-- Opcje usuwania załączników/lokalizacji -->
          <div class="mb-2" v-if="editingExpense.location && editingExpense.location.lat">
            <button type="button" class="btn btn-sm btn-outline-danger w-100 py-2 rounded-3" @click="editForm.deleteLocation = true" v-if="!editForm.deleteLocation">
              <i class="fa-solid fa-map-location-dot me-1"></i> Usuń lokalizację GPS
            </button>
            <div v-else class="text-danger small text-center py-2 bg-light rounded-3 border">
              <i class="fa-solid fa-circle-check"></i> Lokalizacja GPS zostanie usunięta przy zapisie
            </div>
          </div>
          
          <div class="mb-3" v-if="editingExpense.receiptBase64">
            <button type="button" class="btn btn-sm btn-outline-danger w-100 py-2 rounded-3" @click="editForm.deleteReceipt = true" v-if="!editForm.deleteReceipt">
              <i class="fa-solid fa-image me-1"></i> Usuń zdjęcie paragonu
            </button>
            <div v-else class="text-danger small text-center py-2 bg-light rounded-3 border">
              <i class="fa-solid fa-circle-check"></i> Zdjęcie zostanie usunięte przy zapisie
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary-custom flex-grow-1">Zapisz</button>
            <button type="button" class="btn btn-secondary-custom flex-grow-1" @click="editingExpense = null">Anuluj</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Customowe okno potwierdzenia usunięcia wydatku -->
    <div v-if="expenseToDelete" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="bg-white p-4 rounded-4 shadow-lg text-center w-100" style="max-width: 400px; z-index: 1050;">
        <div class="text-danger mb-3" style="font-size: 3rem;">
          <i class="fa-solid fa-circle-exclamation animate__animated animate__pulse animate__infinite"></i>
        </div>
        <h5 class="fw-bold mb-2">Czy jesteś pewien?</h5>
        <p class="text-muted small mb-4">Czy na pewno chcesz usunąć ten wydatek? Ta operacja jest całkowicie nieodwracalna.</p>
        <div class="d-flex gap-2">
          <button class="btn btn-danger flex-grow-1 py-2 rounded-3 fw-bold" @click="confirmDeleteExpense">Tak, usuń</button>
          <button class="btn btn-secondary-custom flex-grow-1 py-2 rounded-3" @click="expenseToDelete = null">Anuluj</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { activeVehicle, activeVehicleExpenses, isDataLoading, loadData } from '../store.js';
import { db } from '../firebase.js';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const selectedReceipt = ref(null);
const editingExpense = ref(null);
const expenseToDelete = ref(null);
const editForm = reactive({
  amount: '',
  mileage: '',
  date: '',
  description: '',
  deleteLocation: false,
  deleteReceipt: false
});

const startEdit = (expense) => {
  editingExpense.value = expense;
  editForm.amount = expense.amount;
  editForm.mileage = expense.mileage;
  editForm.date = expense.date;
  editForm.description = expense.description || '';
  editForm.deleteLocation = false;
  editForm.deleteReceipt = false;
};

const updateExpense = async () => {
  if (!editingExpense.value) return;
  try {
    const docRef = doc(db, "expenses", editingExpense.value.id);
    const updates = {
      amount: parseFloat(editForm.amount).toFixed(2),
      mileage: parseInt(editForm.mileage),
      date: editForm.date,
      description: editingExpense.value.category !== 'paliwo' ? editForm.description : null
    };
    if (editForm.deleteLocation) {
      updates.location = null;
    }
    if (editForm.deleteReceipt) {
      updates.receiptBase64 = null;
    }
    await updateDoc(docRef, updates);
    editingExpense.value = null;
    if (navigator.vibrate) navigator.vibrate(100);
    await loadData();
  } catch (err) {
    console.error("Błąd podczas aktualizacji wydatku:", err);
  }
};

const deleteExpense = (id) => {
  if(navigator.vibrate) navigator.vibrate(50);
  expenseToDelete.value = id;
};

const confirmDeleteExpense = async () => {
  if (!expenseToDelete.value) return;
  try {
    await deleteDoc(doc(db, "expenses", expenseToDelete.value));
    expenseToDelete.value = null;
    if (navigator.vibrate) navigator.vibrate([100, 50]);
    await loadData();
  } catch (err) {
    console.error("Błąd podczas usuwania wydatku:", err);
    expenseToDelete.value = null;
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
