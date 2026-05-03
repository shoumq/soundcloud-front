<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import TrackList from '@/components/TrackList.vue'
import { useRoute } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import { api, type UserProfile } from '@/services/api'
import { useMusicStore } from '@/stores/music'

const route = useRoute()
const store = useMusicStore()
const { isAuthenticated, token } = storeToRefs(store)
const loading = ref(true)
const busy = ref(false)
const profile = ref<UserProfile | null>(null)

const userId = computed(() => String(route.params.id ?? ''))

async function loadProfile() {
  if (!userId.value) {
    profile.value = null
    loading.value = false
    return
  }

  loading.value = true
  try {
    profile.value = await api.getUserProfile(userId.value, token.value || undefined)
  } finally {
    loading.value = false
  }
}

async function toggleFollow() {
  if (!token.value || !profile.value?.user.id) {
    return
  }

  busy.value = true
  try {
    if (profile.value.is_following) {
      await api.unfollowUser(token.value, profile.value.user.id)
    } else {
      await api.followUser(token.value, profile.value.user.id)
    }

    await loadProfile()
  } finally {
    busy.value = false
  }
}

watch(userId, () => {
  void loadProfile()
})

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <section v-if="profile" class="profile-hero">
    <UserAvatar :user="profile.user" />
    <div class="profile-hero-copy">
      <p class="eyebrow">Профиль автора</p>
      <h1>{{ profile.user.username || 'Музыкант' }}</h1>
      <p>{{ profile.user.bio || 'Пользователь пока ничего не рассказал о себе.' }}</p>
      <div class="profile-stats">
        <span>{{ profile.followers_count }} подписчиков</span>
        <span>{{ profile.following_count }} подписок</span>
        <span>{{ profile.can_view_tracks ? `${profile.tracks.length} треков` : 'Треки скрыты' }}</span>
      </div>
      <div class="hero-actions" v-if="isAuthenticated && !profile.is_owner">
        <button type="button" class="primary-button" :disabled="busy" @click="toggleFollow">
          {{ profile.is_following ? 'Отписаться' : 'Подписаться' }}
        </button>
      </div>
    </div>
  </section>

  <section v-if="profile" class="content-grid profile-layout">
    <div class="main-column">
      <TrackList
        v-if="profile.can_view_tracks"
        title="Треки пользователя"
        empty-text="У этого пользователя пока нет опубликованных треков."
        :tracks="profile.tracks"
        :show-album-filter="false"
        @play="store.play"
      />

      <section v-else class="section-block">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Приватность</p>
            <h2>Треки скрыты</h2>
          </div>
        </div>
        <div class="empty-copy compact-empty">Пользователь ограничил доступ к своим трекам.</div>
      </section>
    </div>

    <aside class="side-column">
      <section class="panel">
        <div class="section-heading tight">
          <div>
            <p class="eyebrow">О пользователе</p>
            <h2>Информация</h2>
          </div>
        </div>
        <div class="profile-info-list">
          <div v-if="profile.user.email">
            <strong>Почта</strong>
            <span>{{ profile.user.email }}</span>
          </div>
          <div>
            <strong>Статус</strong>
            <span>{{ profile.user.is_private ? 'Приватный профиль' : 'Открытый профиль' }}</span>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="section-heading tight">
          <div>
            <p class="eyebrow">Подписки</p>
            <h2>На кого подписан</h2>
          </div>
        </div>

        <div v-if="profile.following.length === 0" class="empty-copy compact-empty">Подписок пока нет.</div>
        <div v-else class="follow-list">
          <RouterLink
            v-for="item in profile.following"
            :key="item.id"
            class="follow-row"
            :to="{ name: 'user', params: { id: item.id } }"
          >
            <UserAvatar :user="item" size="small" />
            <div>
              <strong>{{ item.username }}</strong>
              <span>{{ item.bio || 'Без описания' }}</span>
            </div>
          </RouterLink>
        </div>
      </section>
    </aside>
  </section>

  <section v-else-if="!loading" class="page-head">
    <p class="eyebrow">Профиль</p>
    <h1>Пользователь не найден</h1>
    <p>Возможно, профиль был удалён или ссылка указана неверно.</p>
  </section>
</template>
