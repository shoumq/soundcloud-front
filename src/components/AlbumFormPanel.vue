<script setup lang="ts">
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const { albumImportJob, busy, isAuthenticated } = storeToRefs(store)

const albumForm = reactive({
  title: '',
  description: '',
})

const importForm = reactive({
  url: '',
})

async function submitAlbum() {
  await store.createAlbum(albumForm.title, albumForm.description)
  albumForm.title = ''
  albumForm.description = ''
}

async function submitImport() {
  await store.importSoundCloudAlbum(importForm.url)
  importForm.url = ''
}
</script>

<template>
  <section class="panel">
    <div class="section-heading tight">
      <div>
        <p class="eyebrow">Альбомы</p>
        <h2>Новый альбом</h2>
      </div>
    </div>

    <form class="form-stack" @submit.prevent="submitAlbum">
      <label>
        Название
        <input v-model="albumForm.title" type="text" required :disabled="!isAuthenticated" />
      </label>
      <label>
        Описание
        <textarea v-model="albumForm.description" rows="3" :disabled="!isAuthenticated"></textarea>
      </label>
      <button type="submit" class="secondary-button" :disabled="busy || !isAuthenticated">Создать альбом</button>
    </form>

    <form class="form-stack import-form" @submit.prevent="submitImport">
      <label>
        Ссылка на альбом SoundCloud
        <input
          v-model="importForm.url"
          type="url"
          required
          placeholder="https://soundcloud.com/artist/sets/album"
          :disabled="!isAuthenticated"
        />
      </label>
      <button type="submit" class="secondary-button" :disabled="busy || !isAuthenticated || !importForm.url">
        Импортировать альбом
      </button>
      <p v-if="albumImportJob && (albumImportJob.status === 'pending' || albumImportJob.status === 'running')" class="form-note">
        Импорт альбома запущен в фоне. Это может занять несколько минут.
      </p>
    </form>
  </section>
</template>
