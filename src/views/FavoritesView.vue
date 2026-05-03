<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AuthPanel from '@/components/AuthPanel.vue'
import TrackList from '@/components/TrackList.vue'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const { isAuthenticated, tracks } = storeToRefs(store)

const favoriteTracks = computed(() => tracks.value.filter((track) => track.liked_by_me))
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Избранное</p>
    <h1>Любимые треки</h1>
    <p v-if="isAuthenticated">
      Здесь собраны треки, которые вы отметили лайком.
    </p>
    <p v-else>
      Войдите в аккаунт, чтобы видеть свои любимые треки и управлять избранным.
    </p>
  </section>

  <section class="content-grid">
    <div class="main-column">
      <TrackList
        v-if="isAuthenticated"
        title="Любимые треки"
        empty-text="Вы пока не добавили ни один трек в избранное."
        :tracks="favoriteTracks"
        :show-album-filter="false"
        @play="store.play"
      />
      <section v-else class="section-block">
        <div class="empty-copy">Избранное доступно только после входа в аккаунт.</div>
      </section>
    </div>

    <aside class="side-column">
      <AuthPanel />
    </aside>
  </section>
</template>
