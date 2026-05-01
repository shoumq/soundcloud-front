<script setup lang="ts">
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const { albums, busy, isAuthenticated } = storeToRefs(store)
const uploadAudioName = ref('')
const uploadCoverName = ref('')

const uploadForm = reactive<{
  title: string
  albumId: string
  audio: File | null
  cover: File | null
}>({
  title: '',
  albumId: '',
  audio: null,
  cover: null,
})

function onAudioChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  uploadForm.audio = file
  uploadAudioName.value = file?.name ?? ''
}

function onCoverChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  uploadForm.cover = file
  uploadCoverName.value = file?.name ?? ''
}

async function submitUpload() {
  if (!uploadForm.audio) {
    return
  }

  await store.uploadTrack({
    title: uploadForm.title,
    albumId: uploadForm.albumId || undefined,
    audio: uploadForm.audio,
    cover: uploadForm.cover ?? undefined,
  })

  uploadForm.title = ''
  uploadForm.albumId = ''
  uploadForm.audio = null
  uploadForm.cover = null
  uploadAudioName.value = ''
  uploadCoverName.value = ''
}
</script>

<template>
  <section class="panel">
    <div class="section-heading tight">
      <div>
        <p class="eyebrow">Creator tools</p>
        <h2>Upload</h2>
      </div>
    </div>

    <form class="form-stack" @submit.prevent="submitUpload">
      <label>
        Track title
        <input v-model="uploadForm.title" type="text" required :disabled="!isAuthenticated" />
      </label>
      <label>
        Album
        <select v-model="uploadForm.albumId" :disabled="!isAuthenticated">
          <option value="">Single</option>
          <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.title }}</option>
        </select>
      </label>
      <label class="file-input">
        <span>Audio file</span>
        <input type="file" accept="audio/*" required :disabled="!isAuthenticated" @change="onAudioChange" />
        <b>{{ uploadAudioName || 'Choose audio' }}</b>
      </label>
      <label class="file-input">
        <span>Cover image</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          :disabled="!isAuthenticated"
          @change="onCoverChange"
        />
        <b>{{ uploadCoverName || 'Optional cover' }}</b>
      </label>
      <button type="submit" class="primary-button" :disabled="busy || !isAuthenticated || !uploadForm.audio">
        Upload track
      </button>
    </form>
  </section>
</template>
