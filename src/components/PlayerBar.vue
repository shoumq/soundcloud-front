<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Volume2 } from 'lucide-vue-next'
import ArtworkCover from '@/components/ArtworkCover.vue'
import { streamUrl, type Track } from '@/services/api'
import { useMusicStore } from '@/stores/music'
import { formatTime } from '@/utils/music'

const store = useMusicStore()
const { currentTrack } = storeToRefs(store)
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.9)

async function playTrack(track: Track) {
  store.play(track)
  await new Promise((resolve) => window.setTimeout(resolve, 0))
  await audioRef.value?.play().catch(() => undefined)
}

async function togglePlayback() {
  const audio = audioRef.value

  if (!audio || !currentTrack.value) {
    return
  }

  if (audio.paused) {
    await audio.play().catch(() => undefined)
  } else {
    audio.pause()
  }
}

function syncAudioState() {
  const audio = audioRef.value

  if (!audio) {
    return
  }

  currentTime.value = audio.currentTime
  duration.value = audio.duration || 0
  volume.value = audio.volume
  isPlaying.value = !audio.paused
}

function seek(event: Event) {
  const audio = audioRef.value

  if (!audio) {
    return
  }

  const input = event.target as HTMLInputElement
  audio.currentTime = Number(input.value)
  currentTime.value = audio.currentTime
}

function changeVolume(event: Event) {
  const audio = audioRef.value
  const input = event.target as HTMLInputElement
  const nextVolume = Number(input.value)
  volume.value = nextVolume

  if (audio) {
    audio.volume = nextVolume
  }
}

defineExpose({ playTrack })
</script>

<template>
  <footer class="player-bar" :class="{ disabled: !currentTrack }">
    <div class="now-playing">
      <ArtworkCover :item="currentTrack" size="small" />
      <div>
        <strong>{{ currentTrack?.title ?? 'Select a track' }}</strong>
        <span>{{ currentTrack?.artist ?? 'SoundWave' }}</span>
      </div>
    </div>
    <div class="custom-player">
      <button
        type="button"
        class="transport-button"
        :class="{ playing: isPlaying }"
        :disabled="!currentTrack"
        :aria-label="isPlaying ? 'Pause track' : 'Play track'"
        @click="togglePlayback"
      >
        <span aria-hidden="true"></span>
      </button>

      <span class="time-label">{{ formatTime(currentTime) }}</span>
      <input
        class="seek-slider"
        type="range"
        min="0"
        :max="duration || 0"
        step="0.1"
        :value="currentTime"
        :disabled="!currentTrack"
        aria-label="Track progress"
        :style="{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` }"
        @input="seek"
      />
      <span class="time-label">{{ formatTime(duration) }}</span>

      <div class="volume-control">
        <Volume2 class="volume-icon" aria-hidden="true" :size="18" :stroke-width="2.3" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="volume"
          aria-label="Volume"
          :style="{ '--progress': `${volume * 100}%` }"
          @input="changeVolume"
        />
      </div>
    </div>
    <audio
      v-if="currentTrack?.id"
      ref="audioRef"
      :src="streamUrl(currentTrack.id)"
      autoplay
      class="native-audio"
      @play="syncAudioState"
      @pause="syncAudioState"
      @ended="syncAudioState"
      @loadedmetadata="syncAudioState"
      @timeupdate="syncAudioState"
      @volumechange="syncAudioState"
    ></audio>
  </footer>
</template>
