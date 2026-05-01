<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ArtworkCover from '@/components/ArtworkCover.vue'
import { useMusicStore } from '@/stores/music'

const emit = defineEmits<{
  play: []
}>()

const store = useMusicStore()
const { tracks } = storeToRefs(store)
const featuredTrack = computed(() => tracks.value[0] ?? null)
</script>

<template>
  <section class="hero-section">
    <div class="hero-copy">
      <p class="eyebrow">New and rising</p>
      <h1>Listen now, upload next.</h1>
      <p class="hero-text">
        Discover raw drops, collect albums and keep the player close while the next sound takes shape.
      </p>
      <div class="hero-actions">
        <RouterLink :to="{ name: 'stream' }" class="primary-link">Start listening</RouterLink>
        <RouterLink :to="{ name: 'upload' }" class="secondary-link">Upload track</RouterLink>
      </div>
    </div>

    <article v-if="featuredTrack" class="hero-player">
      <ArtworkCover :item="featuredTrack" size="large" />
      <div class="hero-track-meta">
        <span>{{ featuredTrack.artist ?? 'Unknown artist' }}</span>
        <h2>{{ featuredTrack.title ?? 'Untitled track' }}</h2>
        <button type="button" class="play-button" @click="emit('play')">Play</button>
      </div>
      <div class="waveform" aria-hidden="true">
        <span v-for="index in 44" :key="index" :style="{ height: `${18 + ((index * 17) % 58)}px` }"></span>
      </div>
    </article>

    <article v-else class="hero-player empty-state-card">
      <ArtworkCover size="large" />
      <div class="hero-track-meta">
        <span>Waiting for tracks</span>
        <h2>Your stream will appear here</h2>
      </div>
      <div class="waveform muted" aria-hidden="true">
        <span v-for="index in 44" :key="index" :style="{ height: `${16 + ((index * 11) % 42)}px` }"></span>
      </div>
    </article>
  </section>
</template>
