<script setup lang="ts">
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const { busy, isAuthenticated } = storeToRefs(store)

const albumForm = reactive({
  title: '',
  description: '',
})

async function submitAlbum() {
  await store.createAlbum(albumForm.title, albumForm.description)
  albumForm.title = ''
  albumForm.description = ''
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
  </section>
</template>
