import { ref, reactive, computed, watch } from 'vue';
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const currentYear = new Date().getFullYear();
const todayStr = new Date().toISOString().split('T')[0];

export const currentUser = ref(null);
export const vehicles = ref([]);
export const expenses = ref([]);
export const activeVehicleId = ref(null);
export const isDataLoading = ref(false);

export const notifications = ref([
  { id: 1, iconBgClass: 'icon-danger', icon: 'fa-solid fa-car-burst', title: 'Przegląd techniczny za 5 dni', text: 'Twój pojazd wymaga okresowego badania technicznego. Umów wizytę w najbliższej stacji kontroli.', time: 'Dzisiaj, 08:30' },
  { id: 2, iconBgClass: 'icon-warning', icon: 'fa-solid fa-gauge-high', title: 'Niskie ciśnienie w oponach', text: 'Wykryto spadek ciśnienia w prawym przednim kole. Zalecamy dopompowanie opon na stacji.', time: 'Wczoraj, 14:15' },
  { id: 3, iconBgClass: 'icon-promo', icon: 'fa-solid fa-gas-pump', title: 'Nowa promocja na paliwo', text: 'Skorzystaj z weekendowej zniżki na paliwa premium na stacjach partnerskich.', time: '12 Maj, 09:00' }
]);

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

    if (vehicles.value.length > 0) {
      activeVehicleId.value = vehicles.value[0].id;
    }
  } catch (error) {
    console.error("Błąd podczas pobierania danych z Firestore:", error);
  } finally {
    isDataLoading.value = false;
  }
};

export const initAuth = (router) => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    if (user) {
      loadData();
    } else {
      vehicles.value = [];
      expenses.value = [];
      if (router && router.currentRoute.value.name !== 'Login') {
        router.push('/');
      }
    }
  });
};

export const getTodayStr = () => todayStr;
export const getCurrentYear = () => currentYear;
