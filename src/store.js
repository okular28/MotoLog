import { ref, reactive, computed, watch } from 'vue';

const currentYear = new Date().getFullYear();
const todayStr = new Date().toISOString().split('T')[0];

export const currentUser = ref({ email: 'kierowca@motolog.pl', displayName: 'Kierowca' });
export const vehicles = ref([]);
export const expenses = ref([]);
export const activeVehicleId = ref(null);

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

export const loadData = () => {
  const savedVehicles = localStorage.getItem('motolog_vehicles');
  const savedExpenses = localStorage.getItem('motolog_expenses');
  
  if (savedVehicles) vehicles.value = JSON.parse(savedVehicles);
  if (savedExpenses) expenses.value = JSON.parse(savedExpenses);
  
  if (vehicles.value.length > 0) {
    activeVehicleId.value = vehicles.value[0].id;
  }
};

watch(vehicles, (newVal) => localStorage.setItem('motolog_vehicles', JSON.stringify(newVal)), { deep: true });
watch(expenses, (newVal) => localStorage.setItem('motolog_expenses', JSON.stringify(newVal)), { deep: true });

export const getTodayStr = () => todayStr;
export const getCurrentYear = () => currentYear;
