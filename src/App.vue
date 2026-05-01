<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/AppHeader.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const { error } = storeToRefs(store)

onMounted(() => {
  void store.loadLibrary()
})
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main id="top">
      <p v-if="error" class="toast" role="alert">{{ error }}</p>
      <RouterView />
    </main>
    <PlayerBar />
  </div>
</template>
