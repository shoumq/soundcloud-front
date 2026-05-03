<script setup lang="ts">
import { computed } from 'vue'
import { avatarUrl, type User } from '@/services/api'

const props = withDefaults(
  defineProps<{
    user?: User | null
    size?: 'small' | 'large'
  }>(),
  {
    size: 'large',
  },
)

const initials = computed(() => {
  const source = props.user?.username?.trim() || props.user?.email?.trim() || 'SC'

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})
</script>

<template>
  <div class="user-avatar" :class="size">
    <img v-if="user?.id && user.avatar_filename" :src="avatarUrl(user.id)" alt="" />
    <span v-else>{{ initials }}</span>
  </div>
</template>
