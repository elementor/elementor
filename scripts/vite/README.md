# Vite / Rolldown build

Replacement for the Grunt + Webpack toolchain. Both pipelines coexist until cutoff.

## Commands

| Command | Description |
|---------|-------------|
| `npm run styles:vite` | Build CSS (Sass + PostCSS) |
| `npm run scripts:vite` | Build JS via Rolldown |
| `npm run styles:vite:watch` | Watch CSS |
| `npm run scripts:vite:watch` | Watch JS |
| `npm run build:vite` | Full build including the `build/` plugin tree |

## Styles pipeline

`build-styles.mjs` drives `plugins/scss-build.mjs`, which reproduces the task order of
`grunt styles`: generate per-widget entry files, compile every Sass target, autoprefix the
top level stylesheets in place, minify the five glob sets, compile the custom breakpoint
templates behind a proxy import swap, then delete the non-minified widget artifacts.

Two asymmetries from the Grunt pipeline are deliberate and preserved:

- `--dev` and `--watch` stop after the Sass pass, exactly like `grunt styles:true`, so dev
  output is unprefixed and unminified and widget CSS is not regenerated.
- Autoprefixer runs over the unminified `assets/css/*.css` only. Nested folders
  (`conditionals/`, `modules/`, `templates/`, `lib/swiper/css/`) are prefixed solely as part
  of minification, so their unminified output carries no vendor prefixes.

Verified: all 236 compiled stylesheets and `responsive-widgets.json` are byte-identical to
the Grunt output.

## Parity harness

| Command | Description |
|---------|-------------|
| `npm run build:baseline` | Run `grunt styles && grunt scripts`, snapshot to `.build-baseline/` |
| `npm run build:baseline:full` | Run `grunt build`, snapshot assets plus `build/` tree |
| `npm run build:snapshot` | Snapshot current assets to `.vite-build/` without building |
| `npm run build:compare` | Diff `.build-baseline/` against `.vite-build/` |

Structural parity (file existence) is enforced on every tree. Content parity is enforced
byte-for-byte on `.css`, `.asset.php` and `.json` after stripping banners and
`sourceMappingURL` comments. JS bundles are size-checked only, since two bundlers
legitimately emit different module wrappers.

## Baseline findings (Grunt/Webpack, v4.3.0)

Recorded while capturing the reference build; these shape what parity means.

- **Banners are never applied.** `usebanner` runs inside the same `grunt-concurrent`
  block as `scripts` and `styles`, so its output is always overwritten. Zero of 352
  `assets/js/*.js` and zero of 142 `assets/css/*.css` files carry the banner. The Vite
  pipeline must also emit no banner.
- **core-js polyfills are injected into frontend entries** by
  `@babel/preset-env { useBuiltIns: 'usage', corejs: '3.23' }`: `es.array.push`,
  `es.iterator.{constructor,filter,find,for-each,map}`,
  `esnext.iterator.{constructor,filter,find,for-each,map}`, `web.dom-exception.stack`.
  These are dropped in the Vite pipeline by decision. The iterator helpers are the only
  ones not natively available across the `.browserslistrc` range, and they are injected
  because Babel cannot prove `.map()`/`.filter()` receivers are arrays, not because the
  source uses iterator helpers.
- **Dead Sass entries.** `.grunt-config/sass.js` compiles `assets/dev/scss/frontend/swiper.scss`
  and `Gruntfile.js` references `assets/dev/scss/direction/frontend-rtl.scss`; neither file
  exists, so both are silent no-ops that produce no output.
- Baseline volume: 485 files under `assets/js` (352 `.js`, 143 `.min.js`, 64 `.strings.js`,
  71 + 69 hashed `.bundle` chunks, 55 package directories), 236 under `assets/css`,
  `assets/data/responsive-widgets.json`.
