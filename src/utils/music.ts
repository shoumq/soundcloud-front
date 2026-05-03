import type { Album, Track } from '@/services/api'

export function formatDate(value?: string) {
  if (!value) {
    return 'Свежий релиз'
  }

  return new Intl.DateTimeFormat('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export function formatSize(value?: number) {
  if (!value) {
    return 'Поток'
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0')

  return `${minutes}:${seconds}`
}

export function initials(item: Track | Album) {
  const title = item.title ?? 'SC'
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
