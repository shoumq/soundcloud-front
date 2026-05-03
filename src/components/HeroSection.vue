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
      <p class="eyebrow">Свежее и заметное</p>
      <h1>Слушай новое. Загружай своё.</h1>
      <p class="hero-text">
        Слушай новые релизы, собирай любимые треки в альбомы и держи плеер под рукой.
      </p>
      <div class="hero-actions">
        <RouterLink :to="{ name: 'stream' }" class="primary-link">Слушать музыку</RouterLink>
        <RouterLink :to="{ name: 'upload' }" class="secondary-link">Загрузить трек</RouterLink>
      </div>
    </div>

    <article v-if="featuredTrack" class="hero-player">
      <ArtworkCover :item="featuredTrack" size="large" />
      <div class="hero-track-meta">
        <span>{{ featuredTrack.artist ?? 'Неизвестный артист' }}</span>
        <h2>{{ featuredTrack.title ?? 'Трек без названия' }}</h2>
        <button type="button" class="play-button" @click="emit('play')">Слушать</button>
      </div>
      <div class="waveform" aria-hidden="true">
        <span v-for="index in 44" :key="index" :style="{ height: `${18 + ((index * 17) % 58)}px` }"></span>
      </div>
    </article>

    <article v-else class="hero-player empty-state-card">
      <ArtworkCover size="large" />
      <div class="hero-track-meta">
        <span>Пока пусто</span>
        <h2>Здесь появятся ваши треки</h2>
      </div>
      <div class="waveform muted" aria-hidden="true">
        <span v-for="index in 44" :key="index" :style="{ height: `${16 + ((index * 11) % 42)}px` }"></span>
      </div>
    </article>
  </section>
</template>
