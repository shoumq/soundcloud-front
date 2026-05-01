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
        <p class="eyebrow">Account</p>
        <h2>{{ isAuthenticated ? 'Signed in' : 'Join in' }}</h2>
      </div>
    </div>

    <div v-if="isAuthenticated" class="profile-block">
      <div class="avatar">{{ (user?.username ?? user?.email ?? 'A').slice(0, 2).toUpperCase() }}</div>
      <div>
        <strong>{{ user?.username ?? 'Artist' }}</strong>
        <span>{{ user?.email }}</span>
      </div>
    </div>

    <form v-else class="form-stack" @submit.prevent="submitAuth">
      <div class="segmented">
        <button type="button" :class="{ selected: authMode === 'login' }" @click="authMode = 'login'">Login</button>
        <button type="button" :class="{ selected: authMode === 'register' }" @click="authMode = 'register'">
          Register
        </button>
      </div>
      <label>
        Email
        <input v-model="authForm.email" type="email" autocomplete="email" required />
      </label>
      <label v-if="authMode === 'register'">
        Username
        <input v-model="authForm.username" type="text" autocomplete="username" required />
      </label>
      <label>
        Password
        <input v-model="authForm.password" type="password" autocomplete="current-password" minlength="8" required />
      </label>
      <button type="submit" class="primary-button" :disabled="busy">
        {{ busy ? 'Working...' : authMode === 'login' ? 'Sign in' : 'Create account' }}
      </button>
    </form>
  </section>
</template>
