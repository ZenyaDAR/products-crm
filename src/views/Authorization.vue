<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const login = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(login.value, password.value)

    await router.push('/') 
    
  } catch (err) {
    error.value = 'Неверный логин или пароль'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Авторизація</h1>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="login" class="form-label">Логін</label>
          <input
            id="login"
            v-model="login"
            type="text"
            class="form-input"
            placeholder="Введіть логін"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Введіть пароль"
            required
            autocomplete="current-password"
          />
        </div>
        <div class="submit-button-group">
          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? 'Вхід...' : 'Вхід' }}
          </button>
          kateryna.i <br>
          admin
        </div>

        
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Inter:wght@400&display=swap');

.auth-container {
  flex: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f9fafb;
}

.auth-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 25px;
  padding: 65px;
  box-shadow: none;
  max-width: 700px;
  max-height: fit-content;
}

.auth-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.219;
  margin-bottom: 2rem;
  text-align: left;
  color: #000000;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
  height: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.submit-button-group{
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 25px;
  font-weight: 500;
  line-height: 1.219;
  color: #000000;
}

.form-input {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 15px;
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.21;
  background: #ffffff;
  color: #000000;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
}

.form-input::placeholder {
  color: #6b7280;
  opacity: 1;
}

.error-message {
  padding: 0.75rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 0.875rem;
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: 20px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 30px;
  font-weight: 400;
  line-height: 1.21;
  cursor: pointer;
  transition:
    background-color 0.2s,
    opacity 0.2s;
    margin-top: auto;
}

.submit-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
    border-radius: 20px;
  }

  .auth-title {
    font-size: 32px;
    margin-bottom: 1.5rem;
  }

  .form-label {
    font-size: 20px;
  }

  .form-input {
    font-size: 18px;
  }

  .submit-button {
    font-size: 24px;
  }
}
</style>
