export interface User {
  id?: string
  email?: string
  username?: string
  bio?: string
  telegram_id?: string
  avatar_filename?: string
  avatar_content_type?: string
  is_private?: boolean
  show_email?: boolean
  created_at?: string
}

export interface AuthResult {
  user?: User
  token?: string
}

export interface Track {
  id?: string
  owner_id?: string
  album_id?: string
  title?: string
  artist?: string
  filename?: string
  content_type?: string
  size?: number
  cover_filename?: string
  cover_content_type?: string
  cover_size?: number
  created_at?: string
}

export interface Album {
  id?: string
  owner_id?: string
  title?: string
  description?: string
  created_at?: string
}

export interface UserProfile {
  user: User
  tracks: Track[]
  following: User[]
  followers_count: number
  following_count: number
  is_following: boolean
  can_view_tracks: boolean
  is_owner: boolean
}

export interface ApiError {
  error?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message =
      typeof payload?.error === 'string' && payload.error.trim().length > 0
        ? payload.error
        : `Запрос завершился с ошибкой ${response.status}`
    throw new Error(message)
  }

  return payload as T
}

export function streamUrl(trackId: string) {
  return `${API_BASE_URL}/api/v1/tracks/${encodeURIComponent(trackId)}/stream`
}

export function coverUrl(trackId: string) {
  return `${API_BASE_URL}/api/v1/tracks/${encodeURIComponent(trackId)}/cover`
}

export function avatarUrl(userId: string) {
  return `${API_BASE_URL}/api/v1/users/${encodeURIComponent(userId)}/avatar`
}

function authHeaders(token?: string): Record<string, string> {
  if (!token) {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export const api = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    return parseResponse<AuthResult>(response)
  },

  async register(email: string, username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })

    return parseResponse<AuthResult>(response)
  },

  async getTracks() {
    const response = await fetch(`${API_BASE_URL}/api/v1/tracks`)
    return parseResponse<Track[]>(response)
  },

  async getAlbums() {
    const response = await fetch(`${API_BASE_URL}/api/v1/albums`)
    return parseResponse<Album[]>(response)
  },

  async getMe(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/me`, {
      headers: authHeaders(token),
    })
    return parseResponse<UserProfile>(response)
  },

  async getUserProfile(userId: string, token?: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${encodeURIComponent(userId)}`, {
      headers: authHeaders(token),
    })
    return parseResponse<UserProfile>(response)
  },

  async updateMe(token: string, payload: { email: string; username: string; bio: string }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/me`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return parseResponse<User>(response)
  },

  async updatePrivacy(token: string, payload: { isPrivate: boolean; showEmail: boolean }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/me/privacy`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_private: payload.isPrivate,
        show_email: payload.showEmail,
      }),
    })
    return parseResponse<User>(response)
  },

  async uploadAvatar(token: string, avatar: File) {
    const formData = new FormData()
    formData.append('avatar', avatar)

    const response = await fetch(`${API_BASE_URL}/api/v1/me/avatar`, {
      method: 'POST',
      headers: authHeaders(token),
      body: formData,
    })
    return parseResponse<User>(response)
  },

  async followUser(token: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${encodeURIComponent(userId)}/follow`, {
      method: 'POST',
      headers: authHeaders(token),
    })
    return parseResponse<{ ok: boolean }>(response)
  },

  async unfollowUser(token: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${encodeURIComponent(userId)}/follow`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    return parseResponse<{ ok: boolean }>(response)
  },

  async createAlbum(token: string, title: string, description: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/albums`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    })

    return parseResponse<Album>(response)
  },

  async uploadTrack(token: string, payload: { title: string; albumId?: string; audio: File; cover?: File }) {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('audio', payload.audio)

    if (payload.albumId) {
      formData.append('album_id', payload.albumId)
    }

    if (payload.cover) {
      formData.append('cover', payload.cover)
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    return parseResponse<Track>(response)
  },
}
