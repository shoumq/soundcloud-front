<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const route = useRoute()
const router = useRouter()
const { isAuthenticated, user } = storeToRefs(store)

const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const mobileMenuOpen = ref(false)

const accountName = computed(() => user.value?.username ?? user.value?.email ?? 'Музыкант')

watch(
  () => route.query.q,
  (query) => {
    search.value = typeof query === 'string' ? query : ''
    mobileMenuOpen.value = false
  },
)

function submitSearch() {
  mobileMenuOpen.value = false
  void router.push({ name: 'stream', query: search.value.trim() ? { q: search.value.trim() } : {} })
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-row">
      <RouterLink class="brand" :to="{ name: 'home' }" aria-label="SoundWave главная" @click="closeMobileMenu">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-wordmark" aria-hidden="true"></span>
        <span class="sr-only">SoundWave</span>
      </RouterLink>

      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="mobileMenuOpen"
        aria-controls="mobile-navigation"
        aria-label="Открыть меню"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <X v-if="mobileMenuOpen" aria-hidden="true" :size="20" :stroke-width="2.4" />
        <Menu v-else aria-hidden="true" :size="20" :stroke-width="2.4" />
      </button>
    </div>

    <div id="mobile-navigation" class="topbar-content" :class="{ open: mobileMenuOpen }">
      <nav class="nav-links" aria-label="Основная навигация">
        <RouterLink :to="{ name: 'stream' }" @click="closeMobileMenu">Треки</RouterLink>
        <RouterLink :to="{ name: 'favorites' }" @click="closeMobileMenu">Любимые</RouterLink>
        <RouterLink :to="{ name: 'albums' }" @click="closeMobileMenu">Альбомы</RouterLink>
        <RouterLink :to="{ name: 'upload' }" @click="closeMobileMenu">Загрузить</RouterLink>
      </nav>

      <form class="search-wrap" @submit.prevent="submitSearch">
        <input v-model="search" type="search" placeholder="Найти трек или артиста" aria-label="Поиск треков" />
      </form>

      <div class="account-pill">
        <template v-if="isAuthenticated">
          <RouterLink :to="{ name: 'profile' }" @click="closeMobileMenu">{{ accountName }}</RouterLink>
          <button type="button" class="ghost-button compact" @click="store.logout(); closeMobileMenu()">Выйти</button>
        </template>
        <template v-else>
          <span>Гость</span>
        </template>
      </div>
    </div>
  </header>
</template>
