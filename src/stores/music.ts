import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, type Album, type AlbumImportJob, type Track, type User } from '@/services/api'

const TOKEN_KEY = 'soundcloud-front.token'
const USER_KEY = 'soundcloud-front.user'

function readUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as User
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export const useMusicStore = defineStore('music', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) ?? '')
  const user = ref<User | null>(readUser())
  const tracks = ref<Track[]>([])
  const albums = ref<Album[]>([])
  const currentTrack = ref<Track | null>(null)
  const isPlaying = ref(false)
  const playbackProgress = ref(0)
  const loading = ref(false)
  const busy = ref(false)
  const error = ref('')
  const albumImportJob = ref<AlbumImportJob | null>(null)

  const isAuthenticated = computed(() => token.value.length > 0)

  function persistSession(nextToken: string, nextUser: User | null) {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  function setUser(nextUser: User | null) {
    user.value = nextUser
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  function clearError() {
    error.value = ''
  }

  async function loadLibrary() {
    loading.value = true
    clearError()

    try {
      const [nextTracks, nextAlbums] = await Promise.all([api.getTracks(token.value || undefined), api.getAlbums()])
      tracks.value = nextTracks
      albums.value = nextAlbums
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Не удалось загрузить треки и альбомы'
    } finally {
      loading.value = false
    }
  }

  async function refreshMe() {
    if (!token.value) {
      return null
    }

    const profile = await api.getMe(token.value)
    setUser(profile.user)
    return profile
  }

  async function login(email: string, password: string) {
    busy.value = true
    clearError()

    try {
      const result = await api.login(email, password)

      if (!result.token) {
        throw new Error('Отсутствует токен авторизации')
      }

      persistSession(result.token, result.user ?? null)
      await loadLibrary()
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Не удалось выполнить вход'
      throw caught
    } finally {
      busy.value = false
    }
  }

  async function register(email: string, username: string, password: string) {
    busy.value = true
    clearError()

    try {
      const result = await api.register(email, username, password)

      if (!result.token) {
        throw new Error('Отсутствует токен авторизации')
      }

      persistSession(result.token, result.user ?? null)
      await loadLibrary()
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Не удалось зарегистрироваться'
      throw caught
    } finally {
      busy.value = false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    tracks.value = tracks.value.map((track) => ({
      ...track,
      liked_by_me: false,
    }))
    if (currentTrack.value) {
      currentTrack.value = {
        ...currentTrack.value,
        liked_by_me: false,
      }
    }
  }

  function play(track: Track) {
    currentTrack.value = track
    isPlaying.value = false
    playbackProgress.value = 0
  }

  function setPlaybackState(nextState: boolean) {
    isPlaying.value = nextState
  }

  function setPlaybackProgress(nextValue: number) {
    playbackProgress.value = Math.min(1, Math.max(0, nextValue))
  }

  async function createAlbum(title: string, description: string) {
    if (!token.value) {
      throw new Error('Войдите, чтобы создавать альбомы')
    }

    busy.value = true
    clearError()

    try {
      const album = await api.createAlbum(token.value, title, description)
      albums.value = [album, ...albums.value]
      return album
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Не удалось создать альбом'
      throw caught
    } finally {
      busy.value = false
    }
  }

  async function importSoundCloudAlbum(url: string) {
    if (!token.value) {
      throw new Error('Войдите, чтобы импортировать альбомы')
    }

    busy.value = true
    clearError()

    try {
      let job = await api.importSoundCloudAlbum(token.value, url)
      albumImportJob.value = job

      const startedAt = Date.now()
      while (job.status === 'pending' || job.status === 'running') {
        if (Date.now()- startedAt > 20 * 60 * 1000) {
          throw new Error('Импорт альбома превысил лимит ожидания')
        }

        await sleep(2000)
        job = await api.getAlbumImportJob(token.value, job.id)
        albumImportJob.value = job
      }

      if (job.status === 'failed') {
        throw new Error(job.error || 'Не удалось импортировать альбом')
      }

      await loadLibrary()
      return job.album
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Не удалось импортировать альбом'
      throw caught
    } finally {
      busy.value = false
    }
  }

  async function uploadTrack(payload: { title: string; albumId?: string; audio: File; cover?: File }) {
    if (!token.value) {
      throw new Error('Войдите, чтобы загружать треки')
    }

    busy.value = true
    clearError()

    try {
      const track = await api.uploadTrack(token.value, payload)
      tracks.value = [track, ...tracks.value]
      currentTrack.value = track
      return track
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Не удалось загрузить трек'
      throw caught
    } finally {
      busy.value = false
    }
  }

  async function importSoundCloudTrack(payload: { url: string; albumId?: string }) {
    if (!token.value) {
      throw new Error('Войдите, чтобы импортировать треки')
    }

    busy.value = true
    clearError()

    try {
      const track = await api.importSoundCloudTrack(token.value, payload)
      tracks.value = [track, ...tracks.value]
      currentTrack.value = track
      return track
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Не удалось импортировать трек'
      throw caught
    } finally {
      busy.value = false
    }
  }

  function applyTrackUpdate(nextTrack: Track) {
    tracks.value = tracks.value.map((track) => (track.id === nextTrack.id ? nextTrack : track))

    if (currentTrack.value?.id === nextTrack.id) {
      currentTrack.value = nextTrack
    }
  }

  async function toggleTrackLike(trackId: string) {
    if (!token.value) {
      throw new Error('Войдите, чтобы добавлять треки в избранное')
    }

    clearError()

    const track = tracks.value.find((item) => item.id === trackId) ?? (currentTrack.value?.id === trackId ? currentTrack.value : null)
    if (!track?.id) {
      throw new Error('Трек не найден')
    }

    try {
      const nextTrack = track.liked_by_me
        ? await api.unlikeTrack(token.value, track.id)
        : await api.likeTrack(token.value, track.id)

      applyTrackUpdate(nextTrack)
      return nextTrack
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Не удалось обновить избранное'
      throw caught
    }
  }

  return {
    token,
    user,
    tracks,
    albums,
    currentTrack,
    isPlaying,
    playbackProgress,
    loading,
    busy,
    error,
    albumImportJob,
    isAuthenticated,
    clearError,
    loadLibrary,
    refreshMe,
    login,
    register,
    logout,
    play,
    setPlaybackState,
    setPlaybackProgress,
    setUser,
    createAlbum,
    importSoundCloudAlbum,
    uploadTrack,
    importSoundCloudTrack,
    toggleTrackLike,
  }
})
