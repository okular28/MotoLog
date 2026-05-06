import { ref, reactive, computed, watch } from 'vue';
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, setDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';

const currentYear = new Date().getFullYear();
const todayStr = new Date().toISOString().split('T')[0];

export const currentUser = ref(null);
export const vehicles = ref([]);
export const expenses = ref([]);
export const activeVehicleId = ref(null);
export const isDataLoading = ref(false);

// PWA Install Prompt
export const deferredPrompt = ref(window.deferredPromptEvent || null);
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt.value = e;
});

export const notifications = ref([]);

export const activeVehicle = computed(() => vehicles.value.find(v => v.id === activeVehicleId.value));
export const activeVehicleExpenses = computed(() => {
  return expenses.value
    .filter(e => e.vehicleId === activeVehicleId.value)
    .sort((a, b) => b.id - a.id);
});

export const loadData = async () => {
  if (!currentUser.value) return;
  isDataLoading.value = true;
  
  try {
    const qVehicles = query(collection(db, 'vehicles'), where('userId', '==', currentUser.value.uid));
    const querySnapshotV = await getDocs(qVehicles);
    vehicles.value = querySnapshotV.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const qExpenses = query(collection(db, 'expenses'), where('userId', '==', currentUser.value.uid));
    const querySnapshotE = await getDocs(qExpenses);
    expenses.value = querySnapshotE.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (vehicles.value.length > 0 && (!activeVehicleId.value || !vehicles.value.some(v => v.id === activeVehicleId.value))) {
      activeVehicleId.value = vehicles.value[0].id;
    }
    
    checkExpirations(); // Sprawdź badania i ubezpieczenia po załadowaniu danych
  } catch (error) {
    console.error("Błąd podczas pobierania danych z Firestore:", error);
  } finally {
    isDataLoading.value = false;
  }
};

export const addNotificationToFirestore = async (notifData) => {
  if (!currentUser.value) return;
  try {
    const docRef = doc(db, 'users', currentUser.value.uid, 'notifications', String(notifData.id));
    await setDoc(docRef, {
      ...notifData,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Błąd podczas zapisywania powiadomienia w Firestore:", e);
  }
};

export const deleteNotificationFromFirestore = async (id) => {
  if (!currentUser.value) return;
  try {
    await deleteDoc(doc(db, 'users', currentUser.value.uid, 'notifications', String(id)));
  } catch (e) {
    console.error("Błąd podczas usuwania powiadomienia z Firestore:", e);
  }
};

export const checkExpirations = async () => {
  if (!activeVehicle.value) return;
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  // 1. Sprawdzenie badania technicznego (SKP) - 7 dni lub mniej
  if (activeVehicle.value.inspectionDate) {
    const inspDate = new Date(activeVehicle.value.inspectionDate);
    const diffDays = Math.ceil((inspDate - today) / oneDay);
    if (diffDays >= 0 && diffDays <= 7) {
      await addNotificationToFirestore({
        id: 'insp_' + activeVehicle.value.id,
        isAutomated: true,
        iconBgClass: 'icon-danger',
        icon: 'fa-solid fa-car-burst',
        title: 'Zbliża się badanie techniczne!',
        text: `Badanie techniczne pojazdu (${activeVehicle.value.make} ${activeVehicle.value.model}) wygasa za ${diffDays} dni (${activeVehicle.value.inspectionDate}).`
      });
      triggerLocalPushOnce('insp_' + activeVehicle.value.id, 'Zbliża się przegląd techniczny!', `Badanie techniczne pojazdu wygasa za ${diffDays} dni.`);
    }
  }

  // 2. Sprawdzenie ubezpieczenia OC/AC - 7 dni lub mniej
  if (activeVehicle.value.insuranceDate) {
    const insDate = new Date(activeVehicle.value.insuranceDate);
    const diffDays = Math.ceil((insDate - today) / oneDay);
    if (diffDays >= 0 && diffDays <= 7) {
      await addNotificationToFirestore({
        id: 'ins_' + activeVehicle.value.id,
        isAutomated: true,
        iconBgClass: 'icon-warning',
        icon: 'fa-solid fa-shield-halved',
        title: 'Kończy się polisa OC/AC!',
        text: `Ubezpieczenie ubezpieczyciela ${activeVehicle.value.insuranceCompany || ''} kończy się za ${diffDays} dni (${activeVehicle.value.insuranceDate}).`
      });
      triggerLocalPushOnce('ins_' + activeVehicle.value.id, 'Koniec ubezpieczenia!', `Polisa ubezpieczeniowa wygasa za ${diffDays} dni.`);
    }
  }
};

const triggerLocalPushOnce = (id, title, body) => {
  const todayKey = new Date().toISOString().split('T')[0];
  const storageKey = `last_push_${id}`;
  
  // Jeśli dla tego powiadomienia wysłano już dzisiaj push, przerywamy wysyłanie
  if (localStorage.getItem(storageKey) === todayKey) {
    return;
  }
  
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && localStorage.getItem('pushEnabled') === 'true') {
    try {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body: body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: [100, 50, 100]
        });
        localStorage.setItem(storageKey, todayKey);
      });
    } catch (e) {
      new Notification(title, { body: body });
      localStorage.setItem(storageKey, todayKey);
    }
  }
};

// Automatyczne sprawdzanie przy zmianie pojazdu
watch(activeVehicleId, () => {
  checkExpirations();
});

let unsubscribeNotifications = null;

export const initAuth = (router) => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    if (user) {
      loadData();
      
      // Subskrypcja powiadomień użytkownika w czasie rzeczywistym z Firestore
      if (unsubscribeNotifications) unsubscribeNotifications();
      const qNotif = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'));
      unsubscribeNotifications = onSnapshot(qNotif, (snap) => {
        notifications.value = snap.docs.map(doc => {
          const data = doc.data();
          let timeStr = 'Dzisiaj';
          if (data.createdAt) {
            const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt.seconds * 1000);
            timeStr = date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
          }
          return {
            id: doc.id,
            ...data,
            time: timeStr
          };
        });
      });
    } else {
      vehicles.value = [];
      expenses.value = [];
      notifications.value = [];
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
        unsubscribeNotifications = null;
      }
      if (router && router.currentRoute.value.name !== 'Login') {
        router.push('/');
      }
    }
  });
};

export const getTodayStr = () => todayStr;
export const getCurrentYear = () => currentYear;
