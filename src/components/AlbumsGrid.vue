<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@/stores/music'
import { formatDate, initials } from '@/utils/music'

const store = useMusicStore()
const { albums } = storeToRefs(store)
</script>

<template>
  <section class="section-block">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Альбомы</p>
        <h2>Альбомы</h2>
      </div>
    </div>

    <div v-if="albums.length === 0" class="empty-copy">Здесь будут ваши альбомы.</div>

    <div v-else class="album-grid">
      <article v-for="album in albums" :key="album.id" class="album-card">
        <div class="album-art">
          <img v-if="album.artwork_url" :src="album.artwork_url" alt="" />
          <span v-else>{{ initials(album) }}</span>
        </div>
        <div>
          <h3>{{ album.title ?? 'Альбом без названия' }}</h3>
          <p>{{ album.description || 'Описание пока не добавлено.' }}</p>
          <span>{{ formatDate(album.created_at) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
