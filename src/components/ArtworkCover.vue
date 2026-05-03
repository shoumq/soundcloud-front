<script setup lang="ts">
import { coverUrl, type Album, type Track } from '@/services/api'
import { initials } from '@/utils/music'

const props = defineProps<{
  item?: Track | Album | null
  size?: 'small' | 'normal' | 'large'
}>()

function hasTrackCover(item?: Track | Album | null): item is Track {
  return Boolean(item && 'cover_filename' in item && item.cover_filename && item.id)
}
</script>

<template>
  <div class="cover-card" :class="size">
    <img v-if="hasTrackCover(props.item)" :src="coverUrl(props.item.id ?? '')" alt="" />
    <img v-else-if="props.item?.artwork_url" :src="props.item.artwork_url" alt="" />
    <span v-else>{{ props.item ? initials(props.item) : 'SC' }}</span>
  </div>
</template>
