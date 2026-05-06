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

        <div class="mb-3">
          <label class="small text-muted mb-2 d-block">
            <i class="fa-solid fa-camera me-1"></i> Zdjęcie paragonu (opcjonalnie)
          </label>
          <div class="d-flex gap-2 mb-2">
            <button type="button" class="btn btn-secondary-custom flex-grow-1 py-2" @click="triggerCamera('camera')">
              <i class="fa-solid fa-camera me-1"></i> Zrób zdjęcie teraz
            </button>
            <button type="button" class="btn btn-secondary-custom flex-grow-1 py-2" @click="triggerCamera('gallery')">
              <i class="fa-solid fa-image me-1"></i> Wybierz z galerii
            </button>
          </div>
          <!-- Ukryte pola do obsługi kamery/galerii -->
          <input type="file" ref="cameraInput" accept="image/*" capture="environment" class="d-none" @change="handlePhotoUpload">
          <input type="file" ref="galleryInput" accept="image/*" class="d-none" @change="handlePhotoUpload">
          
          <div v-if="newExpense.receiptBase64" class="mt-2 text-center position-relative d-inline-block">
            <img :src="newExpense.receiptBase64" class="img-thumbnail rounded-4 shadow-sm" style="max-height: 120px; object-fit: cover;">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; padding: 0;" @click="newExpense.receiptBase64 = null">
              <i class="fa-solid fa-times text-white" style="font-size: 10px;"></i>
            </button>
          </div>
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

        <button type="submit" class="btn btn-primary-custom w-100" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Zapisz wydatek
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { activeVehicle, activeVehicleId, getTodayStr, currentUser, loadData, addNotificationToFirestore } from '../store.js';
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

const router = useRouter();
const isLoading = ref(false);
const cameraInput = ref(null);
const galleryInput = ref(null);

const newExpense = reactive({ 
  amount: '', category: 'paliwo', mileage: '', date: getTodayStr(),
  description: '', pricePerLiter: '', liters: '', receiptBase64: null
});

const triggerCamera = (type) => {
  if (type === 'camera') {
    cameraInput.value.click();
  } else {
    galleryInput.value.click();
  }
};

const handlePhotoUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      let scaleSize = 1;
      if (img.width > MAX_WIDTH) {
        scaleSize = MAX_WIDTH / img.width;
      }
      canvas.width = img.width * scaleSize;
      canvas.height = img.height * scaleSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Kompresja do 60% jakości JPEG
      newExpense.receiptBase64 = canvas.toDataURL('image/jpeg', 0.6); 
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

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

const saveExpense = async () => {
  if (!currentUser.value || !activeVehicleId.value) return;
  isLoading.value = true;
  if(navigator.vibrate) navigator.vibrate(50);

  let iconClass = 'fa-solid fa-ellipsis';
  if(newExpense.category === 'paliwo') iconClass = 'fa-solid fa-gas-pump';
  if(newExpense.category === 'serwis') iconClass = 'fa-solid fa-wrench';

  let location = null;
  if (navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 });
      });
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch(e) {
      console.warn('Nie udało się pobrać lokalizacji', e);
    }
  }

  try {
    const expenseData = {
      vehicleId: activeVehicleId.value,
      userId: currentUser.value.uid,
      title: newExpense.category.charAt(0).toUpperCase() + newExpense.category.slice(1),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount).toFixed(2),
      date: newExpense.date,
      icon: iconClass,
      mileage: parseInt(newExpense.mileage),
      description: newExpense.category !== 'paliwo' ? newExpense.description : null,
      location: location,
      receiptBase64: newExpense.receiptBase64,
      createdAt: serverTimestamp()
    };

    if (newExpense.category === 'paliwo') {
      expenseData.fuelDetails = {
        liters: parseFloat(newExpense.liters) || 0,
        pricePerLiter: parseFloat(newExpense.pricePerLiter) || 0
      };
    }

    await addDoc(collection(db, "expenses"), expenseData);

    if (activeVehicle.value && newExpense.mileage > activeVehicle.value.mileage) {
      const currentMileage = parseInt(newExpense.mileage);
      const previousMileage = parseInt(activeVehicle.value.mileage || 0);
      
      const prevOilChange = Math.floor(previousMileage / 15000);
      const nextOilChange = Math.floor(currentMileage / 15000);
      
      if (nextOilChange > prevOilChange) {
        await addNotificationToFirestore({
          id: 'oil_' + currentMileage,
          iconBgClass: 'icon-danger',
          icon: 'fa-solid fa-oil-can',
          title: 'Wymagana wymiana oleju!',
          text: `Przebieg Twojego pojazdu (${activeVehicle.value.make} ${activeVehicle.value.model}) wynosi już ${currentMileage} km i przekroczył kolejny próg 15 000 km. Zaplanuj wymianę oleju i filtrów!`
        });
      }

      const vRef = doc(db, "vehicles", activeVehicleId.value);
      await updateDoc(vRef, { mileage: currentMileage });
    }

    if(navigator.vibrate) navigator.vibrate([100, 50, 100]); // Silniejsza wibracja na sukces

    newExpense.amount = ''; newExpense.description = ''; newExpense.pricePerLiter = ''; newExpense.liters = ''; newExpense.receiptBase64 = null;
    await loadData(); 
    router.push('/history');
  } catch (error) {
    console.error("Błąd podczas zapisywania wydatku:", error);
    alert('Wystąpił błąd podczas dodawania wydatku.');
  } finally {
    isLoading.value = false;
  }
};
</script>
