<script setup lang="ts">
import AuthPanel from '@/components/AuthPanel.vue'
import TrackList from '@/components/TrackList.vue'
import UploadPanel from '@/components/UploadPanel.vue'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Музыка</p>
    <h1>Треки</h1>
    <p>Слушайте все загруженные треки, фильтруйте их по альбомам и управляйте воспроизведением прямо со страницы.</p>
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
