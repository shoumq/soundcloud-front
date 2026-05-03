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

const importForm = reactive({
  url: '',
  albumId: '',
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

async function submitImport() {
  await store.importSoundCloudTrack({
    url: importForm.url,
    albumId: importForm.albumId || undefined,
  })

  importForm.url = ''
  importForm.albumId = ''
}
</script>

<template>
  <section class="panel">
    <div class="section-heading tight">
      <div>
        <p class="eyebrow">Загрузка</p>
        <h2>Новый трек</h2>
      </div>
    </div>

    <form class="form-stack" @submit.prevent="submitUpload">
      <label>
        Название трека
        <input v-model="uploadForm.title" type="text" required :disabled="!isAuthenticated" />
      </label>
      <label>
        Альбом
        <select v-model="uploadForm.albumId" :disabled="!isAuthenticated">
          <option value="">Сингл</option>
          <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.title }}</option>
        </select>
      </label>
      <label class="file-input">
        <span>Аудиофайл</span>
        <input type="file" accept="audio/*" required :disabled="!isAuthenticated" @change="onAudioChange" />
        <b>{{ uploadAudioName || 'Выберите файл' }}</b>
      </label>
      <label class="file-input">
        <span>Обложка</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          :disabled="!isAuthenticated"
          @change="onCoverChange"
        />
        <b>{{ uploadCoverName || 'Можно без обложки' }}</b>
      </label>
      <button type="submit" class="primary-button" :disabled="busy || !isAuthenticated || !uploadForm.audio">
        Загрузить трек
      </button>
    </form>

    <form class="form-stack import-form" @submit.prevent="submitImport">
      <label>
        Ссылка SoundCloud
        <input
          v-model="importForm.url"
          type="url"
          required
          placeholder="https://soundcloud.com/artist/track"
          :disabled="!isAuthenticated"
        />
      </label>
      <label>
        Альбом
        <select v-model="importForm.albumId" :disabled="!isAuthenticated">
          <option value="">Сингл</option>
          <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.title }}</option>
        </select>
      </label>
      <button type="submit" class="secondary-button" :disabled="busy || !isAuthenticated || !importForm.url">
        Импортировать из SoundCloud
      </button>
    </form>
  </section>
</template>
