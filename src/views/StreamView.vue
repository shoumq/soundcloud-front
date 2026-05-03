<script setup lang="ts">
import AuthPanel from '@/components/AuthPanel.vue'
import TrackList from '@/components/TrackList.vue'
import UploadPanel from '@/components/UploadPanel.vue'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Обзор</p>
    <h1>Поток</h1>
    <p>Просматривайте все загруженные треки, фильтруйте по альбомам и держите плеер закреплённым во время прослушивания.</p>
  </section>

  <section class="content-grid">
    <div class="main-column">
      <TrackList @play="store.play" />
    </div>

    <aside class="side-column">
      <AuthPanel />
      <UploadPanel />
    </aside>
  </section>
</template>
