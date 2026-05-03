export interface User {
  id?: string
  email?: string
  username?: string
  telegram_id?: string
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
