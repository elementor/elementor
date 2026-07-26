# Vite Build

Vite/Rolldown build pipeline for Elementor Core. Replaces the Grunt + Webpack toolchain.

## Output

During parity validation:

- `.vite-build/assets/js`, `.vite-build/assets/css`, `.vite-build/assets/data` - compiled assets
- `.vite-build/plugin/` - distributable plugin tree

After cutover:

- `assets/js`, `assets/css`, `assets/data` - compiled assets
- `build/` - distributable plugin tree

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Full build (packages + composer + assets + `build/`) |
| `npm run build:baseline` | Grunt reference build copied to `.build-baseline/` |
| `npm run build:vite` | Vite candidate build in `.vite-build/` |
| `npm run build:vite:compare` | Baseline + vite + structural parity check |
| `npm run scripts` | Build JS via Rolldown |
| `npm run styles` | Build CSS via Rolldown SCSS plugin |
| `npm run scripts:watch` | Watch JS (Rolldown native watch) |
| `npm run styles:watch` | Watch CSS (Rolldown native watch) |
| `npm run watch` | Watch packages + scripts + styles |

## Architecture

- `scripts/vite/build-all.mjs` - orchestrator (i18n check + styles + scripts + assemble)
- `scripts/vite/create-config.mjs` - Rolldown configs for base, frontend, packages
- `scripts/vite/build-scripts.mjs` - JS build entrypoint (native watch in dev)
- `scripts/vite/build-styles.mjs` - SCSS/PostCSS pipeline via `scssBuildPlugin`
- `scripts/vite/assemble-plugin.mjs` - full plugin tree copy into `build/`
- `scripts/shared/widgets-css.mjs` - widget CSS temp files + responsive widgets JSON
- `scripts/shared/eicons.mjs` - frontend eicons JS generation
- `scripts/check-textdomain.mjs` - text domain validation

## Prerequisites

Run `npm run build:packages` before asset builds. Package dist outputs are consumed by the packages Rolldown target in production mode.
