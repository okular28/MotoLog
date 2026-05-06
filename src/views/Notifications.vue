<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">Powiadomienia</h4>
      <a href="#" class="text-decoration-none small fw-bold" style="color: var(--brand-orange);" @click.prevent="clearNotifications">Oznacz jako przeczytane</a>
    </div>

    <div v-if="notifications.length === 0 && systemMessages.length === 0" class="text-center py-5 text-muted">
      <i class="fa-regular fa-bell-slash fs-1 mb-3"></i>
      <p>Brak nowych powiadomień.</p>
    </div>

    <div class="notification-list">
      <transition-group name="fade-list" tag="div">
        
        <!-- WIADOMOŚCI SYSTEMOWE (ADMIN) Z FIRESTORE -->
        <div class="notification-item align-items-start d-flex position-relative mb-3 p-3 bg-white rounded-4 border" 
             style="border-left: 4px solid var(--brand-orange) !important;" 
             v-for="msg in systemMessages" :key="msg.id">
          <div :class="['notification-icon me-3', msg.iconBgClass]">
            <i :class="msg.icon"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center">
              <div class="fw-bold small d-flex align-items-center text-dark">
                {{ msg.title }}
                <span class="badge ms-2" style="font-size: 0.58rem; background-color: var(--brand-orange); color: white;">SYSTEM</span>
              </div>
              <div class="text-muted" style="font-size: 0.65rem;">{{ msg.time }}</div>
            </div>
            <div class="text-muted mt-1" style="font-size: 0.8rem; line-height: 1.4;">
              {{ msg.text }}
            </div>
          </div>
        </div>

        <!-- LOKALNE POWIADOMIENIA SPRZĘTOWE (np. Olej, Przeglądy) -->
        <div class="notification-item align-items-start d-flex position-relative mb-3 p-3 bg-white rounded-4 border" 
             v-for="notif in notifications" :key="notif.id">
          <div :class="['notification-icon me-3', notif.iconBgClass]">
            <i :class="notif.icon"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center">
              <div class="fw-bold small text-dark">{{ notif.title }}</div>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { notifications, deleteNotificationFromFirestore } from '../store.js';
import { db } from '../firebase.js';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const systemMessages = ref([]);
let unsubscribe = null;

const clearNotifications = async () => {
  for (const notif of notifications.value) {
    await deleteNotificationFromFirestore(notif.id);
  }
};

const dismissNotification = async (id) => {
  await deleteNotificationFromFirestore(id);
};

onMounted(() => {
  // Real-time subskrypcja wiadomości z kolekcji 'messages' z Firestore
  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(5));
    unsubscribe = onSnapshot(q, (snapshot) => {
      systemMessages.value = snapshot.docs.map(doc => {
        const data = doc.data();
        let timeStr = 'Przed chwilą';
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt.seconds * 1000);
          timeStr = date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        }
        return {
          id: doc.id,
          iconBgClass: data.type === 'alert' ? 'icon-danger' : (data.type === 'info' ? 'icon-warning' : 'icon-promo'),
          icon: data.icon || 'fa-solid fa-bell',
          title: data.title || 'Wiadomość systemowa',
          text: data.text || '',
          time: timeStr
        };
      });
    });
  } catch (error) {
    console.error("Błąd podczas subskrypcji wiadomości systemowych:", error);
  }
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
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
