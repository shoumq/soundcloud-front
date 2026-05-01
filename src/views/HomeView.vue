<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AlbumFormPanel from '@/components/AlbumFormPanel.vue'
import AlbumsGrid from '@/components/AlbumsGrid.vue'
import AuthPanel from '@/components/AuthPanel.vue'
import HeroSection from '@/components/HeroSection.vue'
import TrackList from '@/components/TrackList.vue'
import UploadPanel from '@/components/UploadPanel.vue'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const { tracks } = storeToRefs(store)

function playFeatured() {
  const track = tracks.value[0]

  if (track) {
    store.play(track)
  }
}
</script>

<template>
  <HeroSection @play="playFeatured" />

  <section class="content-grid">
    <div class="main-column">
      <TrackList compact @play="store.play" />
      <AlbumsGrid />
    </div>

    <aside class="side-column">
      <AuthPanel />
      <UploadPanel />
      <AlbumFormPanel />
    </aside>
  </section>
</template>
