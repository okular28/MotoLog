<template>
  <div class="h-100">
    <div id="osm-map"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

let mapInstance = null;

onMounted(() => {
  if(!mapInstance) {
    mapInstance = L.map('osm-map').setView([52.2297, 21.0122], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(mapInstance);
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        mapInstance.setView([lat, lng], 15);
        L.marker([lat, lng]).addTo(mapInstance).bindPopup('Tu jesteś!').openPopup();
      }, 
      (err) => console.warn('Błąd pobierania lokalizacji GPS', err),
      { enableHighAccuracy: true }
    );
  }

  setTimeout(() => { if(mapInstance) mapInstance.invalidateSize(); }, 100);
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>
