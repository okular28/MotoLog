<template>
  <div>
    <h4 class="fw-bold mb-4 text-center">Profil Użytkownika</h4>

    <div class="bg-white p-4 rounded-4 shadow-sm text-center mb-4">
      <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
        <img v-if="currentUser?.photoURL" :src="currentUser.photoURL" alt="Profile" class="rounded-circle w-100 h-100" style="object-fit: cover;">
        <i v-else class="fa-solid fa-user fs-1 text-secondary"></i>
      </div>
      <h5 class="fw-bold mb-1">{{ currentUser?.displayName || 'Kierowca' }}</h5>
      <p class="text-muted small">{{ currentUser?.email }}</p>
    </div>

    <div class="bg-white p-3 rounded-4 shadow-sm mb-4">
      <div class="d-flex align-items-center mb-3" style="cursor: pointer;" @click="showSettingsModal = true">
        <i class="fa-solid fa-gear text-muted me-3 fs-5" style="color: var(--brand-orange) !important;"></i>
        <div class="flex-grow-1 fw-bold">Ustawienia konta i aplikacji</div>
        <i class="fa-solid fa-chevron-right text-muted small"></i>
      </div>
      <hr class="text-muted opacity-25 my-2">
      <div class="d-flex align-items-center mt-3" style="cursor: pointer;" @click="showHelpModal = true">
        <i class="fa-solid fa-circle-question text-muted me-3 fs-5" style="color: var(--brand-orange) !important;"></i>
        <div class="flex-grow-1 fw-bold">Pomoc i wsparcie (FAQ)</div>
        <i class="fa-solid fa-chevron-right text-muted small"></i>
      </div>
      
      <template v-if="deferredPrompt">
        <hr class="text-muted opacity-25 my-2">
        <div class="d-flex align-items-center mt-3" style="cursor: pointer; color: var(--brand-orange);" @click="installApp">
          <i class="fa-solid fa-download me-3 fs-5"></i>
          <div class="flex-grow-1 fw-bold">Zainstaluj aplikację (PWA)</div>
        </div>
      </template>
      <template v-else>
        <hr class="text-muted opacity-25 my-2">
        <div class="mt-2 p-3 bg-light rounded-4 border">
          <div class="fw-bold mb-2 small text-muted"><i class="fa-solid fa-circle-info me-1"></i> Jak zainstalować na telefonie?</div>
          
          <div class="small text-muted mb-2">
            <strong>Na systemie iOS (iPhone - Safari):</strong><br>
            1. Kliknij ikonę <strong>Udostępnij</strong> <i class="fa-solid fa-share-from-square"></i> na dole ekranu.<br>
            2. Wybierz opcję <strong>"Dodaj do ekranu początkowego"</strong>.
          </div>
          
          <div class="small text-muted">
            <strong>Na systemie Android (Chrome):</strong><br>
            1. Kliknij ikonę menu (trzy kropki) <i class="fa-solid fa-ellipsis-vertical"></i> w prawym górnym rogu.<br>
            2. Wybierz opcję <strong>"Dodaj do ekranu głównego"</strong>.<br>
            <span class="text-warning-custom d-block mt-1" style="font-size: 0.72rem; color: #b76e00;"><i class="fa-solid fa-triangle-exclamation"></i> Uwaga: Do automatycznego przycisku instalacji na telefonie wymagane jest bezpieczne połączenie (HTTPS).</span>
          </div>
        </div>
      </template>
    </div>

    <button class="btn btn-outline-danger w-100 p-3 rounded-3 fw-bold mb-4" @click="logout">
      <i class="fa-solid fa-right-from-bracket me-2"></i> Wyloguj się
    </button>

    <!-- Modal: Pomoc i wsparcie (FAQ) -->
    <div v-if="showHelpModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" @click="showHelpModal = false">
      <div class="bg-white p-4 rounded-4 shadow-lg w-100 overflow-auto" style="max-width: 450px; max-height: 80vh; z-index: 1050;" @click.stop>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0">Pomoc i wsparcie</h5>
          <button class="btn-close" @click="showHelpModal = false"></button>
        </div>
        
        <div class="faq-section small text-muted">
          <div class="mb-3">
            <h6 class="fw-bold text-dark mb-1">1. Jak działa lokalizator parkingu?</h6>
            <p class="mb-0">Po zaparkowaniu auta wejdź w zakładkę <strong>Mapa</strong> i kliknij <strong>"Zapisz parking"</strong>. Twoje współrzędne GPS zostaną przypisane do auta, a na mapie pojawi się pomarańczowa pinezka z literą 'P'.</p>
          </div>
          <hr class="my-2">
          <div class="mb-3">
            <h6 class="fw-bold text-dark mb-1">2. Jak dodać zdjęcie paragonu do wydatku?</h6>
            <p class="mb-0">Podczas dodawania wydatku kliknij przycisk <strong>"Zrób zdjęcie teraz"</strong> (wywoła to aparat na telefonie) lub <strong>"Wybierz z galerii"</strong>. Zdjęcie zostanie zoptymalizowane i zapisane w historii.</p>
          </div>
          <hr class="my-2">
          <div class="mb-3">
            <h6 class="fw-bold text-dark mb-1">3. Dlaczego nie działa mi lokalizacja GPS?</h6>
            <p class="mb-0">Upewnij się, że w ustawieniach przeglądarki udzieliłeś aplikacji zgody na dostęp do lokalizacji urządzenia. Możesz to sprawdzić w zakładce <strong>"Ustawienia konta"</strong>.</p>
          </div>
          <hr class="my-2">
          <div class="mb-1 text-center py-2">
            <p class="mb-0 fw-bold text-dark">Masz dodatkowe pytania?</p>
            <span class="text-orange" style="color: var(--brand-orange);">kontakt@motolog-find.pl</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Ustawienia konta i aplikacji -->
    <div v-if="showSettingsModal" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" @click="showSettingsModal = false">
      <div class="bg-white p-4 rounded-4 shadow-lg w-100" style="max-width: 450px; z-index: 1050;" @click.stop>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0">Ustawienia aplikacji</h5>
          <button class="btn-close" @click="showSettingsModal = false"></button>
        </div>
        
        <!-- Ustawienia wizualne -->
        <h6 class="fw-bold small text-muted mb-2 text-uppercase">Wygląd i system</h6>
        <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded-3">
          <div>
            <div class="fw-bold small">Ciemny motyw (Dark Mode)</div>
            <div class="text-muted" style="font-size: 0.72rem;">Przełącz wygląd aplikacji</div>
          </div>
          <div class="form-check form-switch fs-5">
            <input class="form-check-input" type="checkbox" role="switch" v-model="isDarkMode" @change="toggleDarkMode">
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded-3">
          <div>
            <div class="fw-bold small">Wibracje systemowe (Haptics)</div>
            <div class="text-muted" style="font-size: 0.72rem;">Wibracje przy interakcji</div>
          </div>
          <div class="form-check form-switch fs-5">
            <input class="form-check-input" type="checkbox" role="switch" v-model="vibrationEnabled" @change="toggleVibration">
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4 p-2 bg-light rounded-3">
          <div>
            <div class="fw-bold small">Powiadomienia Push (FCM)</div>
            <div class="text-muted" style="font-size: 0.72rem;">{{ pushPermissionStatusText }}</div>
          </div>
          <div class="form-check form-switch fs-5">
            <input class="form-check-input" type="checkbox" role="switch" v-model="pushEnabled" @change="togglePush">
          </div>
        </div>

        <!-- Token FCM do łatwego skopiowania i testowania -->
        <div v-if="pushEnabled && fcmToken" class="mb-4 p-2 bg-white rounded-3 border" style="font-size: 0.65rem;">
          <div class="text-muted fw-bold mb-1"><i class="fa-solid fa-key text-warning me-1"></i> Twój Token Urządzenia (FCM Token):</div>
          <div class="text-truncate text-dark p-2 bg-light rounded select-all" style="font-family: monospace; cursor: pointer;" @click="copyToken">{{ fcmToken }}</div>
          <small class="text-orange d-block mt-1" style="color: var(--brand-orange) !important;"><i class="fa-solid fa-copy me-1"></i> Kliknij powyższy tekst, aby skopiować i przetestować push!</small>
        </div>

        <!-- Uprawnienia urządzenia -->
        <h6 class="fw-bold small text-muted mb-2 text-uppercase">Uprawnienia sprzętowe</h6>
        <div class="p-3 bg-light rounded-4 border mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <div class="fw-bold small"><i class="fa-solid fa-location-dot text-danger me-1"></i> Lokalizacja (GPS)</div>
              <div class="text-muted" style="font-size: 0.7rem;">Status: <span class="fw-bold text-dark">{{ gpsPermissionStatus }}</span></div>
            </div>
            <button class="btn btn-sm btn-secondary-custom py-1 px-2 text-nowrap" @click="requestGps">Zezwól / Sprawdź</button>
          </div>
        </div>

        <button class="btn btn-primary-custom w-100" @click="showSettingsModal = false">Zapisz i zamknij</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, messaging } from '../firebase.js';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { currentUser, deferredPrompt } from '../store.js';

const router = useRouter();

const showHelpModal = ref(false);
const showSettingsModal = ref(false);

// Dark Mode logic
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const toggleDarkMode = () => {
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
  if (vibrationEnabled.value && navigator.vibrate) navigator.vibrate(50);
};

// Vibration logic
const vibrationEnabled = ref(localStorage.getItem('vibrationEnabled') !== 'false');
const toggleVibration = () => {
  localStorage.setItem('vibrationEnabled', vibrationEnabled.value ? 'true' : 'false');
  if (vibrationEnabled.value && navigator.vibrate) navigator.vibrate(50);
};

// Push & FCM Logic
const pushEnabled = ref(localStorage.getItem('pushEnabled') === 'true');
const fcmToken = ref(localStorage.getItem('fcmToken') || '');
const pushPermissionStatusText = ref(pushEnabled.value ? 'Aktywne' : 'Wyłączone');

const togglePush = async () => {
  if (pushEnabled.value) {
    if (!messaging) {
      pushPermissionStatusText.value = 'Brak wsparcia HTTPS/FCM';
      pushEnabled.value = false;
      alert('Powiadomienia Push (FCM) wymagają bezpiecznego połączenia HTTPS lub nie są wspierane przez tę przeglądarkę/środowisko.');
      return;
    }
    try {
      pushPermissionStatusText.value = 'Prośba o zgodę...';
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        pushPermissionStatusText.value = 'Pobieranie tokenu...';
        
        // Wskazujemy na nasz zarejestrowany sw.js
        const registration = await navigator.serviceWorker.ready;
        
        const token = await getToken(messaging, {
          vapidKey: 'BH-0CNXEtwMNUFG51QmiZ-IlF9uDF5mI3nxGjc3vfN8m5Fyf9ElVyo6b_3032-FjMICfmK3v6lRSfVcxFUA3sV8',
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          fcmToken.value = token;
          localStorage.setItem('fcmToken', token);
          localStorage.setItem('pushEnabled', 'true');
          pushPermissionStatusText.value = 'Aktywne';
          
          if (currentUser.value) {
            await setDoc(doc(db, 'users', currentUser.value.uid, 'fcmTokens', token), {
              token: token,
              createdAt: new Date(),
              device: navigator.userAgent
            });
          }
          if (vibrationEnabled.value && navigator.vibrate) navigator.vibrate([50, 150]);
        } else {
          pushPermissionStatusText.value = 'Brak tokenu';
          pushEnabled.value = false;
        }
      } else {
        pushPermissionStatusText.value = 'Brak zgody';
        pushEnabled.value = false;
        localStorage.setItem('pushEnabled', 'false');
      }
    } catch (error) {
      console.error('Błąd podczas rejestracji FCM:', error);
      pushPermissionStatusText.value = 'Błąd serwera';
      pushEnabled.value = false;
      localStorage.setItem('pushEnabled', 'false');
    }
  } else {
    localStorage.setItem('pushEnabled', 'false');
    pushPermissionStatusText.value = 'Wyłączone';
  }
};

const copyToken = () => {
  if (fcmToken.value) {
    navigator.clipboard.writeText(fcmToken.value);
    if (vibrationEnabled.value && navigator.vibrate) navigator.vibrate(50);
    alert('Skopiowano token urządzenia FCM do schowka!');
  }
};

// GPS Permission logic
const gpsPermissionStatus = ref('Kliknij sprawdź');
const requestGps = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(() => {
      gpsPermissionStatus.value = 'Udzielono';
      if (vibrationEnabled.value && navigator.vibrate) navigator.vibrate([100, 50]);
    }, () => {
      gpsPermissionStatus.value = 'Zablokowano';
    });
  } else {
    gpsPermissionStatus.value = 'Brak wsparcia';
  }
};

const checkGpsPermission = async () => {
  if (navigator.permissions) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      gpsPermissionStatus.value = status.state === 'granted' ? 'Udzielono' : (status.state === 'denied' ? 'Zablokowano' : 'Zapytaj');
      status.onchange = () => {
        gpsPermissionStatus.value = status.state === 'granted' ? 'Udzielono' : (status.state === 'denied' ? 'Zablokowano' : 'Zapytaj');
      };
    } catch (e) {
      gpsPermissionStatus.value = 'Kliknij sprawdź';
    }
  }
};

onMounted(() => {
  checkGpsPermission();
  // Ensure theme matches body
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode');
  }
});

const installApp = async () => {
  if (vibrationEnabled.value && navigator.vibrate) navigator.vibrate(50);
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt.value = null;
    }
  }
};

const logout = async () => {
  if (vibrationEnabled.value && navigator.vibrate) navigator.vibrate(100);
  try {
    await signOut(auth);
    currentUser.value = null;
    router.push('/');
  } catch (error) {
    console.error('Błąd przy wylogowywaniu:', error);
  }
};
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
