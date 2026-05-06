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
      <div class="notification-item align-items-start" v-for="notif in notifications" :key="notif.id">
        <div :class="['notification-icon', notif.iconBgClass]">
          <i :class="notif.icon"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between">
            <div class="fw-bold small">{{ notif.title }}</div>
            <div class="text-muted" style="font-size: 0.65rem;">{{ notif.time }}</div>
          </div>
          <div class="text-muted mt-1" style="font-size: 0.8rem; line-height: 1.4;">
            {{ notif.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { notifications } from '../store.js';

const clearNotifications = () => {
  notifications.value = [];
};
</script>
