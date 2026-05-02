<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import ArtworkCover from '@/components/ArtworkCover.vue'
import { type Track } from '@/services/api'
import { useMusicStore } from '@/stores/music'
import { formatSize } from '@/utils/music'

const props = withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const emit = defineEmits<{
  play: [track: Track]
}>()

const route = useRoute()
const store = useMusicStore()
const { albums, currentTrack, isPlaying, loading, playbackProgress, tracks } = storeToRefs(store)
const selectedAlbumId = ref('all')

const query = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim().toLowerCase() : ''))
const visibleTracks = computed(() => (props.compact ? tracks.value.slice(0, 6) : tracks.value))

const filteredTracks = computed(() => {
  return visibleTracks.value.filter((track) => {
    const matchesSearch =
      query.value.length === 0 ||
      [track.title, track.artist, track.filename].some((item) => item?.toLowerCase().includes(query.value))
    const matchesAlbum = selectedAlbumId.value === 'all' || track.album_id === selectedAlbumId.value

    return matchesSearch && matchesAlbum
  })
})

const albumLookup = computed(() => new Map(albums.value.map((album) => [album.id, album.title])))

watch(
  () => albums.value,
  () => {
    if (selectedAlbumId.value !== 'all' && !albums.value.some((album) => album.id === selectedAlbumId.value)) {
      selectedAlbumId.value = 'all'
    }
  },
)

function albumTitle(track: Track) {
  if (!track.album_id) {
    return 'Single'
  }

  return albumLookup.value.get(track.album_id) ?? 'Album'
}

function waveStyle(index: number) {
  const shape = [
    0.32, 0.44, 0.58, 0.74, 0.9, 0.78, 0.56, 0.38, 0.5, 0.7, 0.88, 1, 0.82, 0.62,
    0.46, 0.36, 0.48, 0.66, 0.84, 0.96, 0.8, 0.6, 0.42, 0.3,
  ]
  const level = shape[(index - 1) % shape.length] ?? 0.5

  return {
    height: `${8 + level * 18}px`,
    '--wave-scale': `${0.82 + level * 0.22}`,
    '--wave-delay': `${(index % 6) * 90}ms`,
  }
}

function waveBarClass(track: Track, index: number, total: number) {
  if (currentTrack.value?.id !== track.id) {
    return ''
  }

  const progressIndex = playbackProgress.value * total
  const cursorIndex = Math.max(1, Math.ceil(progressIndex))

  if (index <= Math.floor(progressIndex)) {
    const distanceFromCursor = cursorIndex - index

    if (isPlaying.value && distanceFromCursor >= 0 && distanceFromCursor <= 2) {
      return `passed trail trail-${distanceFromCursor}`
    }

    return 'passed'
  }

  if (cursorIndex === index) {
    return isPlaying.value ? 'current current-playing' : 'current'
  }

  return ''
}
</script>

<template>
  <section class="section-block">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Stream</p>
        <h2>{{ compact ? 'Fresh tracks' : 'Stream' }}</h2>
      </div>
      <select v-model="selectedAlbumId" aria-label="Filter by album">
        <option value="all">All albums</option>
        <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.title }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading-row">Loading tracks...</div>

    <div v-else-if="filteredTracks.length === 0" class="empty-copy">
      No tracks yet. Upload the first one and the stream comes alive.
    </div>

    <div v-else class="track-list">
      <article
        v-for="track in filteredTracks"
        :key="track.id"
        class="track-row"
        :class="{ active: currentTrack?.id === track.id, playing: currentTrack?.id === track.id && isPlaying }"
      >
        <button type="button" class="round-play" :aria-label="`Play ${track.title}`" @click="emit('play', track)">
          <span>{{ currentTrack?.id === track.id ? '||' : '>' }}</span>
        </button>

        <ArtworkCover :item="track" />

        <div class="track-info">
          <span>{{ track.artist ?? 'Unknown artist' }}</span>
          <h3>{{ track.title ?? 'Untitled track' }}</h3>
          <div class="mini-wave" aria-hidden="true">
            <i
              v-for="index in 24"
              :key="index"
              :class="waveBarClass(track, index, 24)"
              :style="waveStyle(index)"
            ></i>
          </div>
        </div>

        <div class="track-side">
          <span>{{ albumTitle(track) }}</span>
          <span>{{ formatSize(track.size) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
