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
        <form @submit.prevent="handleAuth">
          <div class="mb-3 input-group">
            <span class="input-group-text bg-transparent"><i class="fa-regular fa-envelope text-muted"></i></span>
            <input type="email" class="form-control" v-model="loginForm.email" placeholder="Adres e-mail" required>
          </div>
          <div class="mb-2 input-group">
            <span class="input-group-text bg-transparent"><i class="fa-solid fa-lock text-muted"></i></span>
            <input type="password" class="form-control" v-model="loginForm.password" placeholder="Hasło" required>
          </div>
          
          <div class="text-end mb-4">
            <a href="#" class="text-decoration-none small" style="color: var(--brand-orange);" @click.prevent="isRegistering = !isRegistering">
              {{ isRegistering ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się' }}
            </a>
          </div>

          <div v-if="errorMessage" class="alert alert-danger small p-2 mb-3">{{ errorMessage }}</div>

          <button type="submit" class="btn btn-primary-custom w-100 mb-3" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isRegistering ? 'Zarejestruj się' : 'Zaloguj się' }}
          </button>
          
          <div class="text-center text-muted small mb-3">lub</div>
          
          <button type="button" @click="loginWithGoogle" class="btn btn-google w-100 d-flex align-items-center justify-content-center" :disabled="isLoading">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" class="me-2" style="width: 18px;">
            Zaloguj przez Google
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { auth, googleProvider } from '../firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { currentUser } from '../store.js';

const router = useRouter();
const loginForm = reactive({ email: '', password: '' });
const isRegistering = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleAuth = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    if (isRegistering.value) {
      const userCredential = await createUserWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      currentUser.value = userCredential.user;
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      currentUser.value = userCredential.user;
    }
    router.push('/vehicles'); 
  } catch (error) {
    console.error('Błąd autoryzacji:', error);
    errorMessage.value = `Błąd (${error.code || 'unknown'}): ${error.message || 'Wystąpił nieznany błąd.'}`;
    if (error.code === 'auth/email-already-in-use') errorMessage.value = 'Ten adres e-mail jest już używany.';
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') errorMessage.value = 'Nieprawidłowy e-mail lub hasło.';
    if (error.code === 'auth/weak-password') errorMessage.value = 'Hasło jest zbyt słabe (min. 6 znaków).';
    if (error.code === 'auth/operation-not-allowed') errorMessage.value = 'Logowanie E-mail/Hasło nie jest włączone w konsoli Firebase.';
  } finally {
    isLoading.value = false;
  }
};

const loginWithGoogle = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    currentUser.value = userCredential.user;
    router.push('/vehicles');
  } catch (error) {
    console.error('Błąd logowania Google:', error);
    errorMessage.value = `Błąd Google (${error.code || 'unknown'}): ${error.message}`;
    if (error.code === 'auth/operation-not-allowed') errorMessage.value = 'Logowanie Google nie jest włączone w konsoli Firebase.';
  } finally {
    isLoading.value = false;
  }
};
</script>
