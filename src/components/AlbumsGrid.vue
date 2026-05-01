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
        <p class="eyebrow">Collections</p>
        <h2>Albums</h2>
      </div>
    </div>

    <div v-if="albums.length === 0" class="empty-copy">Albums you create will appear here.</div>

    <div v-else class="album-grid">
      <article v-for="album in albums" :key="album.id" class="album-card">
        <div class="album-art">{{ initials(album) }}</div>
        <div>
          <h3>{{ album.title ?? 'Untitled album' }}</h3>
          <p>{{ album.description || 'No description yet.' }}</p>
          <span>{{ formatDate(album.created_at) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
