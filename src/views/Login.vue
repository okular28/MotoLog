<template>
  <div class="content-area d-flex flex-column" style="background: linear-gradient(to bottom, #e9ecef 0%, #f8f9fa 50%); padding-bottom: 0;">
    <div class="flex-grow-1 d-flex flex-column justify-content-center px-4">
      <div class="text-center mb-5">
        <div class="bg-dark text-white rounded-4 d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
          <i class="fa-solid fa-car-side fs-2"></i>
        </div>
        <h2 class="fw-bold">MotoLog & Find</h2>
        <p class="text-muted small">Zarządzaj swoją flotą z łatwością.</p>
      </div>

      <div class="bg-white p-4 rounded-4 shadow-sm">
        <form @submit.prevent="login">
          <div class="mb-3 input-group">
            <span class="input-group-text bg-transparent"><i class="fa-regular fa-envelope text-muted"></i></span>
            <input type="email" class="form-control" v-model="loginForm.email" placeholder="Adres e-mail" required>
          </div>
          <div class="mb-2 input-group">
            <span class="input-group-text bg-transparent"><i class="fa-solid fa-lock text-muted"></i></span>
            <input type="password" class="form-control" v-model="loginForm.password" placeholder="Hasło" required>
          </div>
          <div class="text-end mb-4">
            <a href="#" class="text-decoration-none small" style="color: var(--brand-orange);">Zapomniałeś hasła?</a>
          </div>
          <button type="submit" class="btn btn-primary-custom w-100 mb-3">Zaloguj się</button>
          <div class="text-center text-muted small mb-3">lub</div>
          <button type="button" @click="login" class="btn btn-google w-100 d-flex align-items-center justify-content-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" class="me-2" style="width: 18px;">
            Zaloguj przez Google
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loginForm = reactive({ email: '', password: '' });

const login = () => {
  console.log('Logowanie dla:', loginForm);
  router.push('/vehicles'); 
};
</script>
