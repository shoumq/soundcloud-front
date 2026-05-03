<script setup lang="ts">
import AlbumFormPanel from '@/components/AlbumFormPanel.vue'
import AlbumsGrid from '@/components/AlbumsGrid.vue'
import AuthPanel from '@/components/AuthPanel.vue'
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Коллекции</p>
    <h1>Альбомы</h1>
    <p>Создавайте релизы и держите синглы в аккуратных, удобных для просмотра коллекциях.</p>
  </section>

  <section class="content-grid">
    <div class="main-column">
      <AlbumsGrid />
    </div>

    <aside class="side-column">
      <AuthPanel />
      <AlbumFormPanel />
    </aside>
  </section>
</template>
