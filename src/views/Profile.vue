<template>
  <div>
    <h4 class="fw-bold mb-4 text-center">Profil Użytkownika</h4>

    <div class="bg-white p-4 rounded-4 shadow-sm text-center mb-4">
      <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
        <i class="fa-solid fa-user fs-1 text-secondary"></i>
      </div>
      <h5 class="fw-bold mb-1">Kierowca</h5>
      <p class="text-muted small">kierowca@motolog.pl</p>
    </div>

    <div class="bg-white p-3 rounded-4 shadow-sm mb-4">
      <div class="d-flex align-items-center mb-3" style="cursor: pointer;">
        <i class="fa-solid fa-gear text-muted me-3 fs-5"></i>
        <div class="flex-grow-1">Ustawienia konta</div>
        <i class="fa-solid fa-chevron-right text-muted small"></i>
      </div>
      <hr class="text-muted opacity-25 my-2">
      <div class="d-flex align-items-center mt-3" style="cursor: pointer;">
        <i class="fa-solid fa-circle-question text-muted me-3 fs-5"></i>
        <div class="flex-grow-1">Pomoc i wsparcie</div>
        <i class="fa-solid fa-chevron-right text-muted small"></i>
      </div>
    </div>

    <button class="btn btn-outline-danger w-100 p-3 rounded-3 fw-bold" @click="logout">
      <i class="fa-solid fa-right-from-bracket me-2"></i> Wyloguj się
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  // Tymczasowe wylogowanie - powrót do logowania
  console.log('Wylogowano');
  router.push('/');
};
</script>
