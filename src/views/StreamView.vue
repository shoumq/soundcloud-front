<script setup lang="ts">
import AuthPanel from '@/components/AuthPanel.vue'
import TrackList from '@/components/TrackList.vue'
import UploadPanel from '@/components/UploadPanel.vue'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Explore</p>
    <h1>Stream</h1>
    <p>Browse every uploaded track, filter by album and keep the player docked while you listen.</p>
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
