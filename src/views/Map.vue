<template>
  <div class="h-100 position-relative">
    <div id="osm-map" class="w-100 rounded-4 shadow-sm h-100" style="z-index: 1;"></div>
    
    <div class="position-absolute start-50 translate-middle-x w-100 px-3 d-flex flex-column align-items-center" style="z-index: 10; bottom: 85px;">
      <div class="d-flex gap-2 w-100">
        <button v-if="activeVehicleId" class="btn btn-primary-custom flex-grow-1 shadow py-2" @click="saveParking" :disabled="isLocating">
          <span v-if="isLocating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <i v-else class="fa-solid fa-location-crosshairs me-2"></i>
          Użyj GPS
        </button>
        <button v-if="activeVehicleId && activeVehicle && activeVehicle.parkingLocation" class="btn btn-danger shadow px-3 rounded-3" @click="deleteParking" title="Usuń pozycję parkingu">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <div v-if="activeVehicleId" class="badge bg-dark bg-opacity-75 mt-2 shadow-sm rounded-pill px-3 py-2 fw-normal">
        <i class="fa-regular fa-hand-pointer me-1"></i> lub kliknij na mapie, aby ustawić ręcznie
      </div>
    </div>

    <!-- Customowe okno potwierdzenia usunięcia parkingu -->
    <div v-if="showParkingDeleteConfirm" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="bg-white p-4 rounded-4 shadow-lg text-center w-100" style="max-width: 400px; z-index: 1050;">
        <div class="text-danger mb-3" style="font-size: 3rem;">
          <i class="fa-solid fa-circle-exclamation animate__animated animate__pulse animate__infinite"></i>
        </div>
        <h5 class="fw-bold mb-2">Usuń pozycję parkingu</h5>
        <p class="text-muted small mb-4">Czy na pewno chcesz usunąć zapisaną lokalizację zaparkowanego pojazdu?</p>
        <div class="d-flex gap-2">
          <button class="btn btn-danger flex-grow-1 py-2 rounded-3 fw-bold" @click="confirmDeleteParking">Tak, usuń</button>
          <button class="btn btn-secondary-custom flex-grow-1 py-2 rounded-3" @click="showParkingDeleteConfirm = false">Anuluj</button>
        </div>
      </div>
    </div>

    <!-- Customowe okno potwierdzenia RĘCZNEGO dodania parkingu -->
    <div v-if="showManualConfirm" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="bg-white p-4 rounded-4 shadow-lg text-center w-100" style="max-width: 400px; z-index: 1050;">
        <div class="text-primary mb-3" style="font-size: 3rem;">
          <i class="fa-solid fa-map-location-dot animate__animated animate__bounceIn"></i>
        </div>
        <h5 class="fw-bold mb-2">Zapisz parking tutaj?</h5>
        <p class="text-muted small mb-4">Czy chcesz ustawić to miejsce jako nową lokalizację Twojego pojazdu?</p>
        <div class="d-flex gap-2">
          <button class="btn btn-primary-custom flex-grow-1 py-2 rounded-3 fw-bold" @click="confirmManualParking">Zapisz</button>
          <button class="btn btn-secondary-custom flex-grow-1 py-2 rounded-3" @click="cancelManualParking">Anuluj</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue';
import { activeVehicle, expenses, activeVehicleId } from '../store.js';
import { db } from '../firebase.js';
import { doc, updateDoc } from 'firebase/firestore';

const showParkingDeleteConfirm = ref(false);
const showManualConfirm = ref(false);
const manualLocation = ref(null);

let mapInstance = null;
let parkingMarker = null;
let tempManualMarker = null;
let expenseMarkers = [];
const isLocating = ref(false);

const renderMarkers = () => {
  if (!mapInstance) return;

  expenseMarkers.forEach(m => mapInstance.removeLayer(m));
  expenseMarkers = [];
  
  if (parkingMarker) mapInstance.removeLayer(parkingMarker);
  if (tempManualMarker) mapInstance.removeLayer(tempManualMarker);

  // Renderowanie wydatków z lokalizacją
  expenses.value.forEach(exp => {
    if (exp.location && exp.location.lat && exp.location.lng) {
      let m = L.marker([exp.location.lat, exp.location.lng]).addTo(mapInstance)
        .bindPopup(`<b>${exp.title}</b><br>${exp.amount} zł<br>${exp.date}`);
      expenseMarkers.push(m);
    }
  });

  // Renderowanie zaparkowanego auta
  if (activeVehicle.value && activeVehicle.value.parkingLocation) {
    const pLoc = activeVehicle.value.parkingLocation;
    const parkIcon = L.divIcon({
      html: '<div style="background-color:#ff761a;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.3);"><i class="fa-solid fa-p"></i></div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    parkingMarker = L.marker([pLoc.lat, pLoc.lng], { icon: parkIcon }).addTo(mapInstance)
      .bindPopup('<b style="color:var(--brand-orange);">Twoje auto!</b><br>Zaparkowane tutaj.').openPopup();
  }
};

// Zapis parkingu po GPS
const saveParking = async () => {
  if (!activeVehicleId.value) return;
  if (navigator.vibrate) navigator.vibrate(50);
  isLocating.value = true;
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const pLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude, time: new Date().toISOString() };
      try {
        const vRef = doc(db, "vehicles", activeVehicleId.value);
        await updateDoc(vRef, { parkingLocation: pLoc });
        
        activeVehicle.value.parkingLocation = pLoc;
        renderMarkers();
        mapInstance.setView([pLoc.lat, pLoc.lng], 16);
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } catch (err) {
        console.error("Błąd zapisu parkingu:", err);
      } finally {
        isLocating.value = false;
      }
    }, (err) => {
      alert('Nie udało się pobrać dokładnej lokalizacji GPS.');
      isLocating.value = false;
    }, { enableHighAccuracy: true, timeout: 8000 });
  } else {
    isLocating.value = false;
  }
};

// RĘCZNY zapis parkingu
const confirmManualParking = async () => {
  if (!activeVehicleId.value || !manualLocation.value) return;
  try {
    const vRef = doc(db, "vehicles", activeVehicleId.value);
    await updateDoc(vRef, { parkingLocation: manualLocation.value });
    
    activeVehicle.value.parkingLocation = manualLocation.value;
    showManualConfirm.value = false;
    renderMarkers();
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  } catch (err) {
    console.error("Błąd zapisu ręcznego parkingu:", err);
  }
};

const cancelManualParking = () => {
  showManualConfirm.value = false;
  manualLocation.value = null;
  if (tempManualMarker && mapInstance) {
    mapInstance.removeLayer(tempManualMarker);
  }
};

const deleteParking = () => {
  if(navigator.vibrate) navigator.vibrate(50);
  showParkingDeleteConfirm.value = true;
};

const confirmDeleteParking = async () => {
  if (!activeVehicleId.value) return;
  try {
    const vRef = doc(db, "vehicles", activeVehicleId.value);
    await updateDoc(vRef, { parkingLocation: null });
    
    if (activeVehicle.value) {
      activeVehicle.value.parkingLocation = null;
    }
    showParkingDeleteConfirm.value = false;
    renderMarkers();
    if(navigator.vibrate) navigator.vibrate([100, 50]);
  } catch (err) {
    console.error("Błąd usuwania parkingu:", err);
    showParkingDeleteConfirm.value = false;
  }
};

onMounted(() => {
  if(!mapInstance) {
    mapInstance = L.map('osm-map').setView([52.2297, 21.0122], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(mapInstance);
  }

  mapInstance.on('click', (e) => {
    if (!activeVehicleId.value) return;
    
    manualLocation.value = { 
      lat: e.latlng.lat, 
      lng: e.latlng.lng, 
      time: new Date().toISOString() 
    };

    if (tempManualMarker) mapInstance.removeLayer(tempManualMarker);
    
    tempManualMarker = L.marker([e.latlng.lat, e.latlng.lng], { opacity: 0.6 }).addTo(mapInstance);
    
    if (navigator.vibrate) navigator.vibrate(20);
    showManualConfirm.value = true;
  });

  renderMarkers();

  // Skup mapę na aucie lub użytkowniku
  if (activeVehicle.value && activeVehicle.value.parkingLocation) {
    mapInstance.setView([activeVehicle.value.parkingLocation.lat, activeVehicle.value.parkingLocation.lng], 15);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      if (!(activeVehicle.value && activeVehicle.value.parkingLocation)) {
        mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 13);
      }
    });
  }

  setTimeout(() => { if(mapInstance) mapInstance.invalidateSize(); }, 200);
});

watch([expenses, activeVehicleId], () => {
  renderMarkers();
}, { deep: true });

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
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