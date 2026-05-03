import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const siteURL = normalizeSiteURL(
  process.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    'https://dropwave.ru',
)

const publicDir = path.resolve('public')
const now = new Date().toISOString()

const routes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/stream', changefreq: 'daily', priority: '0.9' },
  { path: '/albums', changefreq: 'daily', priority: '0.8' },
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXML(new URL(route.path, siteURL).toString())}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', siteURL).toString()}
`

await mkdir(publicDir, { recursive: true })
await writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8')
await writeFile(path.join(publicDir, 'robots.txt'), robots, 'utf8')

function normalizeSiteURL(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) {
    return 'https://example.com'
  }

  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
}

function escapeXML(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
