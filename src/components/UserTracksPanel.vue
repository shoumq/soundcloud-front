<script setup lang="ts">
import ArtworkCover from '@/components/ArtworkCover.vue'
import { type Track } from '@/services/api'

defineProps<{
  title: string
  emptyText: string
  tracks: Track[]
}>()

const emit = defineEmits<{
  play: [track: Track]
}>()
</script>

<template>
  <section class="section-block">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Треки</p>
        <h2>{{ title }}</h2>
      </div>
    </div>

    <div v-if="tracks.length === 0" class="empty-copy">{{ emptyText }}</div>

    <div v-else class="track-list">
      <article v-for="track in tracks" :key="track.id" class="track-row">
        <button type="button" class="round-play" :aria-label="`Воспроизвести ${track.title}`" @click="emit('play', track)">
          <span>&gt;</span>
        </button>

        <ArtworkCover :item="track" />

        <div class="track-info">
          <span>{{ track.artist ?? 'Неизвестный артист' }}</span>
          <h3>{{ track.title ?? 'Трек без названия' }}</h3>
        </div>

        <div class="track-side">
          <span class="track-file">{{ track.filename }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
