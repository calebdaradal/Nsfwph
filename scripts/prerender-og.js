/**
 * Build-time prerender: writes one index.html per file slug with correct
 * Open Graph meta so link previews (Messenger, Facebook, etc.) show the thumbnail.
 * No backend needed — runs after `vite build`, uses Supabase data.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')

// Load .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, optional VITE_SITE_URL)
try {
  const envPath = path.join(root, '.env')
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8')
    env.split('\n').forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) {
        const key = m[1].trim()
        const val = m[2].trim().replace(/^["']|["']$/g, '')
        process.env[key] = val
      }
    })
  }
} catch (_) {}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
const siteUrl = (process.env.VITE_SITE_URL || '').replace(/\/$/, '') || 'https://ultragarden.netlify.app'

if (!supabaseUrl || !anonKey) {
  console.warn('prerender-og: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY, skipping')
  process.exit(0)
}

function escapeAttr(s) {
  if (s == null || s === '') return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function injectOg(html, file) {
  const title = escapeAttr(file.title || 'Ultra Garden of PH')
  const description = escapeAttr(file.subtitle || file.title || 'File catalogue and downloads')
  const image = file.thumbnail?.startsWith('http')
    ? file.thumbnail
    : `${siteUrl}${(file.thumbnail || '').startsWith('/') ? '' : '/'}${file.thumbnail || ''}`

  let out = html
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${title} | Ultra Garden of PH</title>`)
  out = out.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`
  )
  out = out.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`
  )
  out = out.replace(
    /<meta property="og:image" content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escapeAttr(image)}" />`
  )
  out = out.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`
  )
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`
  )
  out = out.replace(
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`
  )
  return out
}

async function main() {
  const indexPath = path.join(distDir, 'index.html')
  if (!fs.existsSync(indexPath)) {
    console.warn('prerender-og: dist/index.html not found (run vite build first)')
    process.exit(1)
  }

  const html = fs.readFileSync(indexPath, 'utf8')

  const res = await fetch(`${supabaseUrl}/rest/v1/files?select=id,slug,thumbnail,title,subtitle`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    console.warn('prerender-og: Supabase request failed', res.status, await res.text())
    process.exit(0)
  }

  const files = await res.json()
  if (!Array.isArray(files) || files.length === 0) {
    console.log('prerender-og: no files, skipping')
    process.exit(0)
  }

  const fileDir = path.join(distDir, 'file')
  let count = 0
  for (const file of files) {
    const slug = file.slug || file.id
    if (!slug) continue
    const dir = path.join(fileDir, slug)
    fs.mkdirSync(dir, { recursive: true })
    const fileHtml = injectOg(html, file)
    fs.writeFileSync(path.join(dir, 'index.html'), fileHtml, 'utf8')
    count++
  }

  console.log(`prerender-og: wrote ${count} file preview pages to dist/file/<slug>/index.html`)
}

main().catch((err) => {
  console.warn('prerender-og:', err.message)
  process.exit(0)
})
