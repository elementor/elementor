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

## Scripts pipeline

`build-scripts.mjs` builds each entry as its own Rolldown IIFE bundle, matching the four Webpack
configs (`base` and `frontend`, each in development and production). `qunit` is a third target that
emits only the eight filenames `karma.conf.js` loads.

Three decisions carry the pipeline and are not optional:

- **Babel is retained for the transform stage** (`plugins/babel-legacy.mjs`). Rolldown refuses any
  target below ES2015, but the Backbone and Marionette layers depend on the ES5 downlevel Babel
  performed: Backbone's `extend` uses an object literal's `constructor` member as the child
  constructor and reads `.prototype` off members such as `Collection#model`, and a shorthand method
  has neither a `[[Construct]]` slot nor a prototype. Targeting ES2020 left them as shorthand
  methods and took Qunit from 261 passing to 70 failing. The bundler still owns resolution, tree
  shaking, externals and minification; only the syntax lowering stays with Babel, and it costs
  roughly 4s of the 31s JS build.
- **The two preset sets are asymmetric, as in Webpack.** Frontend entries use bare
  `@babel/preset-env` with `useBuiltIns: 'usage'`, everything else uses `@wordpress/default`. The
  two resolve different browser targets, so frontend output legitimately retains arrow functions
  while base output does not.
- **`@babel/plugin-transform-modules-commonjs` is deliberately dropped.** Rolldown needs ESM to
  apply externals and tree shaking. This is the one intentional semantic change, and it is why
  candidate bundles are consistently smaller: `e-wc-product-editor.js` falls from 107KB to 6KB
  because `@wordpress/element`'s `useState`/`useEffect` collapse to the already-external `react`
  global instead of bundling the whole package, which the CommonJS-transformed Webpack graph could
  not see through.

`plugins/webpack-shims.mjs` neutralises `assets/dev/js/public-path.js`. It assigns Webpack's
`__webpack_public_path__` free variable to tell the Webpack runtime where to fetch lazy chunks;
IIFE output cannot code split, so nothing is ever fetched. Left in place the assignment threw a
`ReferenceError` that aborted the rest of the frontend entry before
`window.elementorFrontend = new Frontend()`, which surfaced only as "The preview could not be
loaded" in the editor with no console error on the editor page itself.

Every dynamic import is inlined, since IIFE cannot code split. `webpack.runtime[.min].js` is
emitted as a no-op so the `elementor-webpack-runtime` script handle still resolves in PHP.

Two source files needed fixing because Rolldown validates named imports against a package's real
exports where Webpack did not. Both were latent bugs, and both still build under Grunt:

- `assets/dev/js/editor/utils/helpers.js` imported `isValidAttribute` as a named export of
  `dompurify`, which only exposes it as an instance member.
- `core/common/modules/events-manager/assets/js/module.js` imported the `Mixpanel` type as a value
  from `mixpanel-browser`, using it only in a JSDoc annotation.

Verified: Qunit 261/261 and Jest 800/800 pass with the tests unmodified, all 432 non-chunk
`assets/js` filenames are present, `.strings.js` content matches, and the editor loads and
takes element selection against a live site.

## Packages pipeline

`build-packages.mjs` builds the 55 `elementorV2` libraries into
`assets/js/packages/<name>/<name>[.min].js`, replacing `.grunt-config/webpack.packages.js` and the
four Webpack plugins under `packages/packages/tools`. Entries are discovered by scanning
`packages/packages/core`, `packages/packages/libs` and `packages/apps`, plus `ui` and `icons` from
node_modules.

- **Production consumes `dist/index.mjs`, not `dist/index.js`.** Webpack read the CommonJS build
  through `main`, but Rolldown cannot externalize a `require()`, so every dependency would be
  bundled and `.asset.php` would list no deps at all. All 53 packages that ship `dist/index.js`
  also ship the ESM `dist/index.mjs` built from the same sources.
- **The `window.elementorV2` assignment is written explicitly**
  (`plugins/packages-library-entry.mjs`). Given a dotted `output.name`, Rolldown's IIFE emits the
  namespace guard but never assigns the entry's exports to the leaf, so the library would be
  undefined. A generated entry module performs the assignment instead, and no output name is used.
- **`react-dom` reaches the dependency list through the CommonJS rewriter.** `v4-activation-modal`
  imports `react-dom/client`, which is not itself mapped and so gets bundled; its inner
  `require( 'react-dom' )` is what needs the global. `plugins/cjs-externals.mjs` reports the
  requests it rewires so `.asset.php` can include them, matching how Webpack picked them up by
  walking the chunk's module graph.

TypeScript and JSX are handled by esbuild rather than Babel, since these presets only strip types
and compile JSX with no downlevel. The development build additionally runs `@emotion/babel-plugin`
for readable class names, exactly as the Webpack development rule did.

Verified: all 55 `.asset.php` files and `.strings.js` files are byte-identical to the Grunt output.
Loading every bundle in dependency order under jsdom with real React registers 51 of 55 globals for
both development and production, and the Grunt baseline scores identically on the same harness; the
4 exceptions are jsdom canvas and coercion limits, not build differences.

## Parity harness

| Command | Description |
|---------|-------------|
| `npm run build:baseline` | Run `grunt styles && grunt scripts`, snapshot to `.build-baseline/` |
| `npm run build:baseline:full` | Run `grunt build`, snapshot assets plus `build/` tree |
| `npm run build:snapshot` | Snapshot current assets to `.vite-build/` without building |
| `npm run build:compare` | Diff `.build-baseline/` against `.vite-build/` |

Structural parity (file existence) is enforced on every tree. Content parity is enforced
byte-for-byte on `.css`, `.asset.php`, `.json` and `.strings.js` after stripping banners and
`sourceMappingURL` comments. JS bundles are size-checked only, since two bundlers
legitimately emit different module wrappers. Hashed `.bundle` chunks are counted but not
compared, because inlining every dynamic import means the candidate emits none.

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
