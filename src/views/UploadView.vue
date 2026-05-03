<script setup lang="ts">
import AlbumFormPanel from '@/components/AlbumFormPanel.vue'
import AuthPanel from '@/components/AuthPanel.vue'
import UploadPanel from '@/components/UploadPanel.vue'
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Загрузка</p>
    <h1>Добавить трек</h1>
    <p>Загрузите трек, добавьте обложку и при желании прикрепите его к альбому.</p>
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
