<script setup lang="ts">
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const { busy, isAuthenticated, user } = storeToRefs(store)
const authMode = ref<'login' | 'register'>('login')

const authForm = reactive({
  email: '',
  username: '',
  password: '',
})

async function submitAuth() {
  if (authMode.value === 'login') {
    await store.login(authForm.email, authForm.password)
  } else {
    await store.register(authForm.email, authForm.username, authForm.password)
  }

  authForm.password = ''
}
</script>

<template>
  <section class="panel auth-panel">
    <div class="section-heading tight">
      <div>
        <p class="eyebrow">Аккаунт</p>
        <h2>{{ isAuthenticated ? 'Вы вошли' : 'Войти' }}</h2>
      </div>
    </div>

    <div v-if="isAuthenticated" class="profile-block">
      <div class="avatar">{{ (user?.username ?? user?.email ?? 'А').slice(0, 2).toUpperCase() }}</div>
      <div>
        <strong>{{ user?.username ?? 'Артист' }}</strong>
        <span>{{ user?.email }}</span>
      </div>
    </div>

    <form v-else class="form-stack" @submit.prevent="submitAuth">
      <div class="segmented">
        <button type="button" :class="{ selected: authMode === 'login' }" @click="authMode = 'login'">Вход</button>
        <button type="button" :class="{ selected: authMode === 'register' }" @click="authMode = 'register'">
          Регистрация
        </button>
      </div>
      <label>
        Почта
        <input v-model="authForm.email" type="email" autocomplete="email" required />
      </label>
      <label v-if="authMode === 'register'">
        Имя пользователя
        <input v-model="authForm.username" type="text" autocomplete="username" required />
      </label>
      <label>
        Пароль
        <input v-model="authForm.password" type="password" autocomplete="current-password" minlength="8" required />
      </label>
      <button type="submit" class="primary-button" :disabled="busy">
        {{ busy ? 'Подождите...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт' }}
      </button>
    </form>
  </section>
</template>
