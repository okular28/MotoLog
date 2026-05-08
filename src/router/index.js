import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Vehicles from '../views/Vehicles.vue';
import AddVehicle from '../views/AddVehicle.vue';
import VehicleDetails from '../views/VehicleDetails.vue';
import Notifications from '../views/Notifications.vue';
import History from '../views/History.vue';
import AddExpense from '../views/AddExpense.vue';
import MapView from '../views/Map.vue';
import Profile from '../views/Profile.vue';

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/vehicles', name: 'Vehicles', component: Vehicles },
  { path: '/add-vehicle', name: 'AddVehicle', component: AddVehicle },
  { path: '/details', name: 'VehicleDetails', component: VehicleDetails },
  { path: '/notifications', name: 'Notifications', component: Notifications },
  { path: '/history', name: 'History', component: History },
  { path: '/add-expense', name: 'AddExpense', component: AddExpense },
  { path: '/map', name: 'Map', component: MapView },
  { path: '/profile', name: 'Profile', component: Profile },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
