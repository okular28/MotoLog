<template>
  <div class="app-container">
    <!-- Baner Offline -->
    <div v-if="!isOnline" class="text-center py-2 px-3 small fw-bold shadow-sm" style="background-color: var(--brand-orange) !important; color: white !important; z-index: 2000; font-size: 0.78rem;">
      <i class="fa-solid fa-wifi-slash me-2"></i> Pracujesz w trybie offline. Dane zsynchronizują się automatycznie.
    </div>

    <!-- WIDOK: Logowanie (tylko na /) -->
    <router-view v-if="route.name === 'Login'"></router-view>

    <!-- WIDOKI PO ZALOGOWANIU -->
    <template v-else>
      <!-- Górny pasek -->
      <div class="top-bar shadow-sm">
        <i class="fa-solid fa-car"></i>
        <span class="text-truncate px-2" style="max-width: 65%;">
          {{ activeVehicle && route.name !== 'Notifications' && route.name !== 'Profile' ? `${activeVehicle.make} ${activeVehicle.model}` : 'MotoLog & Find' }}
        </span>
        <div class="d-flex align-items-center gap-3">
          <!-- Powiadomienia -->
          <i class="fa-solid fa-bell position-relative" style="cursor: pointer; color: var(--brand-orange);" @click="router.push('/notifications')">
            <span v-if="notifications.length > 0" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span class="visually-hidden">Nowe powiadomienia</span>
            </span>
          </i>
          <!-- Profil -->
          <i class="fa-solid fa-user" style="cursor: pointer; color: var(--brand-orange);" @click="router.push('/profile')"></i>
        </div>
      </div>

      <main class="content-area" :class="{'p-0 h-100': route.name === 'Map'}" :style="route.name === 'Map' ? 'overflow: hidden !important;' : ''">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- Dolny Pasek Nawigacji -->
      <nav class="bottom-nav shadow-lg">
        <router-link to="/map" class="nav-item">
          <i class="fa-regular fa-map"></i>
          Mapa
        </router-link>
        <router-link to="/add-expense" class="nav-item">
          <i class="fa-solid fa-circle-plus"></i>
          Wydatek
        </router-link>
        <router-link to="/history" class="nav-item">
          <i class="fa-solid fa-clock-rotate-left"></i>
          Historia
        </router-link>
        <router-link to="/details" class="nav-item">
          <i class="fa-solid fa-file-lines"></i>
          Dane
        </router-link>
        <router-link to="/vehicles" class="nav-item">
          <i class="fa-solid fa-car"></i>
          Pojazdy
        </router-link>
      </nav>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { initAuth, activeVehicle, notifications, currentUser } from './store.js';

const route = useRoute();
const router = useRouter();
const isOnline = ref(navigator.onLine);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

onMounted(() => {
  initAuth(router);
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style>
/* Global styles are imported in main.js */

/* Płynne przejścia między podstronami */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
