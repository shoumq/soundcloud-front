<script setup lang="ts">
import AlbumFormPanel from '@/components/AlbumFormPanel.vue'
import AuthPanel from '@/components/AuthPanel.vue'
import UploadPanel from '@/components/UploadPanel.vue'
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Creator tools</p>
    <h1>Upload</h1>
    <p>Add a track, attach cover art and optionally place it into one of your albums.</p>
  </section>

  <section class="content-grid">
    <div class="main-column">
      <UploadPanel />
    </div>

    <aside class="side-column">
      <AuthPanel />
      <AlbumFormPanel />
    </aside>
  </section>
</template>
