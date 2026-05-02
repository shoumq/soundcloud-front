import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, type Album, type Track, type User } from '@/services/api'

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

  const isAuthenticated = computed(() => token.value.length > 0)

  function persistSession(nextToken: string, nextUser: User | null) {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  function clearError() {
    error.value = ''
  }

  async function loadLibrary() {
    loading.value = true
    clearError()

    try {
      const [nextTracks, nextAlbums] = await Promise.all([api.getTracks(), api.getAlbums()])
      tracks.value = nextTracks
      albums.value = nextAlbums

      if (!currentTrack.value && nextTracks.length > 0) {
        currentTrack.value = nextTracks[0] ?? null
      }
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Could not load library'
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    busy.value = true
    clearError()

    try {
      const result = await api.login(email, password)

      if (!result.token) {
        throw new Error('Auth token is missing')
      }

      persistSession(result.token, result.user ?? null)
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Could not sign in'
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
        throw new Error('Auth token is missing')
      }

      persistSession(result.token, result.user ?? null)
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Could not create account'
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
      throw new Error('Sign in to create albums')
    }

    busy.value = true
    clearError()

    try {
      const album = await api.createAlbum(token.value, title, description)
      albums.value = [album, ...albums.value]
      return album
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Could not create album'
      throw caught
    } finally {
      busy.value = false
    }
  }

  async function uploadTrack(payload: { title: string; albumId?: string; audio: File; cover?: File }) {
    if (!token.value) {
      throw new Error('Sign in to upload tracks')
    }

    busy.value = true
    clearError()

    try {
      const track = await api.uploadTrack(token.value, payload)
      tracks.value = [track, ...tracks.value]
      currentTrack.value = track
      return track
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'Could not upload track'
      throw caught
    } finally {
      busy.value = false
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
    isAuthenticated,
    clearError,
    loadLibrary,
    login,
    register,
    logout,
    play,
    setPlaybackState,
    setPlaybackProgress,
    createAlbum,
    uploadTrack,
  }
})
