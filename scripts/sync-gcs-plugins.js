#!/usr/bin/env node
/**
 * Downloads staging WordPress plugins from a GCS bucket and extracts them
 * into tests/wp-env/plugins/ so .wp-env.json can reference them as local paths.
 *
 * Requires gsutil (Google Cloud SDK): https://cloud.google.com/sdk/docs/install
 *   gcloud auth login
 *
 * Environment variables:
 *   GCS_BUCKET_NAME     — bucket name (required)
 *   GCS_PLUGINS_PREFIX  — prefix inside bucket (default: wp-plugins/)
 *
 * Usage:
 *   npm run wp:plugins:sync
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const envFile = path.resolve(__dirname, '../.env')
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf-8')
    .split('\n')
    .forEach(line => {
      const [key, ...rest] = line.split('=')
      if (key && rest.length && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join('=').trim()
      }
    })
}

const REPO_ROOT = path.resolve(__dirname, '..')
const PLUGINS_DIR = path.join(REPO_ROOT, 'tests', 'wp-env', 'plugins')
const TEMP_DIR = path.join(REPO_ROOT, 'tests', 'wp-env', '.gcs-temp')

const GCS_BUCKET = process.env.GCS_BUCKET_NAME
const GCS_PREFIX = process.env.GCS_PLUGINS_PREFIX || 'wp-plugins/'

if ( ! GCS_BUCKET ) {
  console.error( '❌  GCS_BUCKET_NAME is not set. Set it as an env var or GitHub Actions variable WP_PLUGINS_GCS_BUCKET.' )
  process.exit( 1 )
}

const GCS_PLUGINS = [
  'elementor-dev-tools.zip',
  'stg-runner.php_.zip'
]

function hasGsutil () {
  try {
    execSync('gsutil --version', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function analyzeZipLayout (zipPath) {
  const output = execSync(`unzip -Z1 "${zipPath}"`, { encoding: 'utf-8', stdio: 'pipe' })
  const entries = output
    .split('\n')
    .map(e => e.trim())
    .filter(Boolean)
    .filter(e => !e.startsWith('__MACOSX/'))

  if (entries.length === 0) return { type: 'empty' }

  const top = entries[0].split('/')[0]
  return entries.every(e => e.startsWith(`${top}/`))
    ? { type: 'folder', top }
    : { type: 'flat' }
}

function normalizeSlug (slug) {
  return slug
    .replace(/\.php_$/, '')
    .replace(/-[\d.]+$/, '')
}

function syncPlugins () {
  if (!hasGsutil()) {
    console.error('❌  gsutil not found. Install Google Cloud SDK and run: gcloud auth login')
    process.exit(1)
  }

  fs.mkdirSync(PLUGINS_DIR, { recursive: true })
  fs.mkdirSync(TEMP_DIR, { recursive: true })

  let synced = 0

  for (const zipFile of GCS_PLUGINS) {
    const gsUri = `gs://${GCS_BUCKET}/${GCS_PREFIX}${zipFile}`
    const localZip = path.join(TEMP_DIR, zipFile)

    console.log(`⬇️  ${zipFile}`)

    try {
      execSync(`gsutil -o "GSUtil:parallel_process_count=1" cp "${gsUri}" "${localZip}"`, { stdio: 'pipe' })
    } catch {
      console.error(`   ✗ Failed to download — skipping`)
      continue
    }

    const layout = analyzeZipLayout(localZip)

    if (layout.type === 'empty') {
      console.warn(`   ✗ Empty zip — skipping`)
      fs.unlinkSync(localZip)
      continue
    }

    if (layout.type === 'folder') {
      execSync(`unzip -q -o "${localZip}" -d "${PLUGINS_DIR}"`, { stdio: 'pipe' })
      const normalized = normalizeSlug(layout.top)
      if (normalized !== layout.top) {
        const oldPath = path.join(PLUGINS_DIR, layout.top)
        const newPath = path.join(PLUGINS_DIR, normalized)
        if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
          fs.renameSync(oldPath, newPath)
        }
      }
      console.log(`   ✓ → tests/wp-env/plugins/${normalized}`)
    } else {
      const slug = normalizeSlug(path.basename(zipFile, '.zip'))
      const targetDir = path.join(PLUGINS_DIR, slug)
      fs.mkdirSync(targetDir, { recursive: true })
      execSync(`unzip -q -o "${localZip}" -d "${targetDir}"`, { stdio: 'pipe' })
      console.log(`   ✓ → tests/wp-env/plugins/${slug}`)
    }

    fs.unlinkSync(localZip)
    synced++
  }

  try { fs.rmdirSync(TEMP_DIR) } catch { /* not empty */ }

  if (synced === GCS_PLUGINS.length) {
    console.log(`\n✅  All ${synced} plugins synced`)
  } else {
    console.error(`\n❌  Synced ${synced}/${GCS_PLUGINS.length} — check bucket: gs://${GCS_BUCKET}/${GCS_PREFIX}`)
    process.exit(1)
  }
}

syncPlugins()
