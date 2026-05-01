<script setup lang="ts">
import AlbumFormPanel from '@/components/AlbumFormPanel.vue'
import AlbumsGrid from '@/components/AlbumsGrid.vue'
import AuthPanel from '@/components/AuthPanel.vue'
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Collections</p>
    <h1>Albums</h1>
    <p>Create releases and keep singles organized into clean, browsable collections.</p>
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
