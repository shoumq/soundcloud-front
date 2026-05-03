<script setup lang="ts">
import AlbumFormPanel from '@/components/AlbumFormPanel.vue'
import AuthPanel from '@/components/AuthPanel.vue'
import UploadPanel from '@/components/UploadPanel.vue'
</script>

<template>
  <section class="page-head">
    <p class="eyebrow">Инструменты автора</p>
    <h1>Загрузка</h1>
    <p>Добавьте трек, прикрепите обложку и при желании поместите его в один из своих альбомов.</p>
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
