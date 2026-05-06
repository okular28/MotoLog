<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">Powiadomienia</h4>
      <a href="#" class="text-decoration-none small fw-bold" style="color: var(--brand-orange);" @click.prevent="clearNotifications">Oznacz jako przeczytane</a>
    </div>

    <div v-if="notifications.length === 0" class="text-center py-5 text-muted">
      <i class="fa-regular fa-bell-slash fs-1 mb-3"></i>
      <p>Brak nowych powiadomień.</p>
    </div>

    <div class="notification-list">
      <transition-group name="fade-list" tag="div">
        <div class="notification-item align-items-start d-flex position-relative mb-3 p-3 bg-white rounded-4 border" v-for="notif in notifications" :key="notif.id">
          <div :class="['notification-icon me-3', notif.iconBgClass]">
            <i :class="notif.icon"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center">
              <div class="fw-bold small">{{ notif.title }}</div>
              <div class="text-muted" style="font-size: 0.65rem; margin-right: 1.5rem;">{{ notif.time }}</div>
            </div>
            <div class="text-muted mt-1" style="font-size: 0.8rem; line-height: 1.4;">
              {{ notif.text }}
            </div>
          </div>
          <button class="btn border-0 p-0 position-absolute" style="top: 10px; right: 12px; color: var(--brand-orange);" @click="dismissNotification(notif.id)">
            <i class="fa-solid fa-times small"></i>
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { notifications } from '../store.js';

const clearNotifications = () => {
  notifications.value = [];
};

const dismissNotification = (id) => {
  notifications.value = notifications.value.filter(notif => notif.id !== id);
};
</script>

<style scoped>
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.3s ease;
}
.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
