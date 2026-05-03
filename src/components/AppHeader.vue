<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const route = useRoute()
const router = useRouter()
const { isAuthenticated, user } = storeToRefs(store)

const search = ref(typeof route.query.q === 'string' ? route.query.q : '')

const accountName = computed(() => user.value?.username ?? user.value?.email ?? 'Музыкант')

watch(
  () => route.query.q,
  (query) => {
    search.value = typeof query === 'string' ? query : ''
  },
)

function submitSearch() {
  void router.push({ name: 'stream', query: search.value.trim() ? { q: search.value.trim() } : {} })
}
</script>

<template>
  <header class="topbar">
    <RouterLink class="brand" :to="{ name: 'home' }" aria-label="SoundWave главная">
      <span class="brand-mark" aria-hidden="true"></span>
      <span>SoundWave</span>
    </RouterLink>

    <nav class="nav-links" aria-label="Основная навигация">
      <RouterLink :to="{ name: 'stream' }">Треки</RouterLink>
      <RouterLink :to="{ name: 'albums' }">Альбомы</RouterLink>
      <RouterLink :to="{ name: 'upload' }">Загрузить</RouterLink>
    </nav>

    <form class="search-wrap" @submit.prevent="submitSearch">
      <input v-model="search" type="search" placeholder="Найти трек или артиста" aria-label="Поиск треков" />
    </form>

    <div class="account-pill">
      <template v-if="isAuthenticated">
        <span>{{ accountName }}</span>
        <button type="button" class="ghost-button compact" @click="store.logout">Выйти</button>
      </template>
      <template v-else>
        <span>Гость</span>
      </template>
    </div>
  </header>
</template>
