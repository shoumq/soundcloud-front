<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Copy, ExternalLink, Play } from 'lucide-vue-next'
import ArtworkCover from '@/components/ArtworkCover.vue'
import { api, type Track } from '@/services/api'
import { useMusicStore } from '@/stores/music'

const route = useRoute()
const router = useRouter()
const store = useMusicStore()
const track = ref<Track | null>(null)
const loading = ref(false)
const error = ref('')
const copied = ref(false)

const trackId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const shareUrl = computed(() => {
  if (!trackId.value) {
    return ''
  }

  return new URL(router.resolve({ name: 'track', params: { id: trackId.value } }).href, window.location.origin).toString()
})

async function loadTrack() {
  if (!trackId.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    track.value = await api.getTrack(trackId.value)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Не удалось загрузить трек'
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  if (!shareUrl.value) {
    return
  }

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(shareUrl.value)
  } else {
    const input = document.createElement('input')
    input.value = shareUrl.value
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.append(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1800)
}

function playTrack() {
  if (track.value) {
    store.play(track.value)
  }
}

function mixerBarStyle(index: number) {
  const levels = [
    0.24, 0.42, 0.68, 0.88, 0.54, 0.36, 0.76, 0.96, 0.62, 0.48, 0.82, 0.58,
    0.34, 0.7, 0.92, 0.66, 0.44, 0.78,
  ]
  const level = levels[(index - 1) % levels.length] ?? 0.5

  return {
    height: `${34 + level * 126}px`,
    '--mixer-delay': `${(index % 7) * 80}ms`,
  }
}

function selectShareInput(event: Event) {
  const input = event.target as HTMLInputElement
  input.select()
}

watch(trackId, () => {
  void loadTrack()
})

onMounted(() => {
  void loadTrack()
})
</script>

<template>
  <section class="track-card-page">
    <div v-if="loading" class="loading-row">Загружаем трек...</div>
    <div v-else-if="error" class="empty-copy">{{ error }}</div>

    <article v-else-if="track" class="track-card">
      <ArtworkCover :item="track" size="large" />

      <div class="track-card-copy">
        <p class="eyebrow">{{ track.source_provider === 'soundcloud' ? 'SoundCloud импорт' : 'Трек' }}</p>
        <h1>{{ track.title ?? 'Трек без названия' }}</h1>
        <RouterLink v-if="track.owner_id" class="track-artist-link" :to="{ name: 'user', params: { id: track.owner_id } }">
          {{ track.artist ?? 'Неизвестный артист' }}
        </RouterLink>
        <span v-else>{{ track.artist ?? 'Неизвестный артист' }}</span>

        <div class="track-mixer" aria-hidden="true">
          <i v-for="index in 18" :key="index" :style="mixerBarStyle(index)"></i>
        </div>

        <div class="track-card-actions">
          <button type="button" class="primary-button icon-button" @click="playTrack">
            <Play aria-hidden="true" :size="17" :stroke-width="2.4" />
            Воспроизвести
          </button>
          <button type="button" class="secondary-button icon-button" @click="copyLink">
            <Copy aria-hidden="true" :size="17" :stroke-width="2.4" />
            {{ copied ? 'Скопировано' : 'Скопировать ссылку' }}
          </button>
          <a v-if="track.source_url" class="secondary-link icon-button source-link" :href="track.source_url" target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" :size="17" :stroke-width="2.4" />
            Источник
          </a>
        </div>

        <input class="share-field" type="text" readonly :value="shareUrl" aria-label="Ссылка на трек" @focus="selectShareInput" />
      </div>
    </article>
  </section>
</template>
