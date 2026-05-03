<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import TrackList from '@/components/TrackList.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { api, type User, type UserProfile } from '@/services/api'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const { token, user } = storeToRefs(store)
const loading = ref(true)
const saving = ref(false)
const profile = ref<UserProfile | null>(null)
const avatarName = ref('')

const profileForm = reactive({
  email: '',
  username: '',
  bio: '',
})

const privacyForm = reactive({
  isPrivate: false,
  showEmail: false,
})

function syncForms(nextUser: User) {
  profileForm.email = nextUser.email ?? ''
  profileForm.username = nextUser.username ?? ''
  profileForm.bio = nextUser.bio ?? ''
  privacyForm.isPrivate = Boolean(nextUser.is_private)
  privacyForm.showEmail = Boolean(nextUser.show_email)
}

async function loadProfile() {
  if (!token.value) {
    loading.value = false
    profile.value = null
    return
  }

  loading.value = true
  try {
    const nextProfile = await api.getMe(token.value)
    profile.value = nextProfile
    syncForms(nextProfile.user)
    store.setUser(nextProfile.user)
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (!token.value) {
    return
  }

  saving.value = true
  try {
    const nextUser = await api.updateMe(token.value, profileForm)
    if (profile.value) {
      profile.value = { ...profile.value, user: nextUser }
    }
    store.setUser(nextUser)
  } finally {
    saving.value = false
  }
}

async function savePrivacy() {
  if (!token.value) {
    return
  }

  saving.value = true
  try {
    const nextUser = await api.updatePrivacy(token.value, privacyForm)
    if (profile.value) {
      profile.value = { ...profile.value, user: nextUser }
    }
    store.setUser(nextUser)
  } finally {
    saving.value = false
  }
}

async function uploadAvatar(event: Event) {
  if (!token.value) {
    return
  }

  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  avatarName.value = file.name
  saving.value = true
  try {
    const nextUser = await api.uploadAvatar(token.value, file)
    if (profile.value) {
      profile.value = { ...profile.value, user: nextUser }
    }
    store.setUser(nextUser)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <section class="profile-hero" v-if="profile">
    <UserAvatar :user="profile.user" />
    <div class="profile-hero-copy">
      <p class="eyebrow">Мой профиль</p>
      <h1>{{ profile.user.username || user?.username || 'Музыкант' }}</h1>
      <p>{{ profile.user.bio || 'Расскажите о себе, добавьте аватар и настройте видимость профиля.' }}</p>
      <div class="profile-stats">
        <span>{{ profile.tracks.length }} треков</span>
        <span>{{ profile.followers_count }} подписчиков</span>
        <span>{{ profile.following_count }} подписок</span>
      </div>
    </div>
  </section>

  <section v-else-if="!loading" class="page-head">
    <p class="eyebrow">Профиль</p>
    <h1>Нужен вход</h1>
    <p>Войдите в аккаунт, чтобы редактировать профиль, аватар и настройки приватности.</p>
  </section>

  <section v-if="profile" class="content-grid profile-layout">
    <div class="main-column">
      <section class="section-block">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Профиль</p>
            <h2>Основная информация</h2>
          </div>
        </div>

        <form class="form-stack" @submit.prevent="saveProfile">
          <label>
            Почта
            <input v-model="profileForm.email" type="email" required />
          </label>
          <label>
            Имя пользователя
            <input v-model="profileForm.username" type="text" required />
          </label>
          <label>
            О себе
            <textarea v-model="profileForm.bio" rows="4"></textarea>
          </label>
          <button type="submit" class="primary-button" :disabled="saving">Сохранить профиль</button>
        </form>
      </section>

      <TrackList
        title="Загруженные треки"
        empty-text="У вас пока нет загруженных треков."
        :tracks="profile.tracks"
        :show-album-filter="false"
        @play="store.play"
      />
    </div>

    <aside class="side-column">
      <section class="panel">
        <div class="section-heading tight">
          <div>
            <p class="eyebrow">Аватар</p>
            <h2>Фото профиля</h2>
          </div>
        </div>

        <label class="file-input">
          <span>Изменить аватар</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="uploadAvatar" />
          <b>{{ avatarName || 'Выберите изображение' }}</b>
        </label>
      </section>

      <section class="panel">
        <div class="section-heading tight">
          <div>
            <p class="eyebrow">Приватность</p>
            <h2>Кто что видит</h2>
          </div>
        </div>

        <form class="form-stack" @submit.prevent="savePrivacy">
          <label class="check-row">
            <input v-model="privacyForm.isPrivate" type="checkbox" />
            <span>Сделать профиль приватным</span>
          </label>
          <label class="check-row">
            <input v-model="privacyForm.showEmail" type="checkbox" />
            <span>Показывать почту в профиле</span>
          </label>
          <button type="submit" class="secondary-button" :disabled="saving">Сохранить настройки</button>
        </form>
      </section>

      <section class="panel">
        <div class="section-heading tight">
          <div>
            <p class="eyebrow">Подписки</p>
            <h2>На кого вы подписаны</h2>
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
</template>
