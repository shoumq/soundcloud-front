<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
// import { Copy, ExternalLink } from 'lucide-vue-next'
import ArtworkCover from '@/components/ArtworkCover.vue'
import { type Track } from '@/services/api'
import { useMusicStore } from '@/stores/music'

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
const router = useRouter()
const store = useMusicStore()
const { albums, currentTrack, isPlaying, loading, playbackProgress, tracks } = storeToRefs(store)
const selectedAlbumId = ref('all')
const copiedTrackId = ref('')

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
    return 'Отдельный трек'
  }

  return albumLookup.value.get(track.album_id) ?? 'Альбом'
}

function trackShareUrl(track: Track) {
  if (!track.id) {
    return ''
  }

  return new URL(router.resolve({ name: 'track', params: { id: track.id } }).href, window.location.origin).toString()
}

async function writeClipboard(value: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value)
    return
  }

  const input = document.createElement('input')
  input.value = value
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.append(input)
  input.select()
  document.execCommand('copy')
  input.remove()
}

async function copyTrackLink(track: Track) {
  const url = trackShareUrl(track)
  if (!url || !track.id) {
    return
  }

  await writeClipboard(url)
  copiedTrackId.value = track.id
  window.setTimeout(() => {
    if (copiedTrackId.value === track.id) {
      copiedTrackId.value = ''
    }
  }, 1600)
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
        <p class="eyebrow">Музыка</p>
        <h2>{{ compact ? 'Новые треки' : 'Все треки' }}</h2>
      </div>
      <select v-model="selectedAlbumId" aria-label="Фильтр по альбому">
        <option value="all">Все альбомы</option>
        <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.title }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading-row">Загружаем треки...</div>

    <div v-else-if="filteredTracks.length === 0" class="empty-copy">
      Пока ни одного трека. Загрузите первый и начните собирать свою библиотеку.
    </div>

    <div v-else class="track-list">
      <article
        v-for="track in filteredTracks"
        :key="track.id"
        class="track-row"
        :class="{ active: currentTrack?.id === track.id, playing: currentTrack?.id === track.id && isPlaying }"
      >
        <button type="button" class="round-play" :aria-label="`Воспроизвести ${track.title}`" @click="emit('play', track)">
          <span>{{ currentTrack?.id === track.id ? '||' : '>' }}</span>
        </button>

        <RouterLink v-if="track.id" class="track-cover-link" :to="{ name: 'track', params: { id: track.id } }">
          <ArtworkCover :item="track" />
        </RouterLink>
        <ArtworkCover v-else :item="track" />

        <div class="track-info">
          <RouterLink v-if="track.owner_id" class="track-artist-link" :to="{ name: 'user', params: { id: track.owner_id } }">
            {{ track.artist ?? 'Неизвестный артист' }}
          </RouterLink>
          <span v-else>{{ track.artist ?? 'Неизвестный артист' }}</span>
          <h3>
            <RouterLink v-if="track.id" :to="{ name: 'track', params: { id: track.id } }">
              {{ track.title ?? 'Трек без названия' }}
            </RouterLink>
            <span v-else>{{ track.title ?? 'Трек без названия' }}</span>
          </h3>
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
          <!-- <div class="track-actions">
            <RouterLink
              v-if="track.id"
              class="track-action-button"
              :to="{ name: 'track', params: { id: track.id } }"
              :aria-label="`Открыть карточку ${track.title}`"
            >
              <ExternalLink aria-hidden="true" :size="16" :stroke-width="2.3" />
            </RouterLink>
            <button
              type="button"
              class="track-action-button"
              :aria-label="`Скопировать ссылку на ${track.title}`"
              @click="copyTrackLink(track)"
            >
              <Copy aria-hidden="true" :size="16" :stroke-width="2.3" />
              <span class="copy-state">{{ copiedTrackId === track.id ? 'OK' : '' }}</span>
            </button>
          </div> -->
        </div>
      </article>
    </div>
  </section>
</template>
