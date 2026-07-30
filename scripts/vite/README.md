# Build pipeline

Elementor Core builds with Vite and Rolldown. This directory is the whole build; there is no Grunt
and no Webpack.

Babel is still here, and deliberately so: Rolldown will not target below ES2015, but the Backbone and
Marionette layers need real ES5 function prototypes. See [Scripts pipeline](#scripts-pipeline).

`webpack` also remains a devDependency, because the plugins published from
`packages/packages/tools/` declare it as a peer and their tests compile with it. Nothing in Core's
own build uses it.

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Everything, including the `build/` plugin tree |
| `npm run styles` | CSS (Sass + PostCSS) |
| `npm run scripts` | JS bundles and package bundles |
| `npm run packages:assets` | Package bundles only |
| `npm run styles:watch` | Watch CSS |
| `npm run scripts:watch` | Watch JS and packages |
| `npm run test:qunit` | Build the Qunit bundles and run Karma |

## Styles pipeline

`build-styles.mjs` drives `plugins/scss-build.mjs`: generate per-widget entry files, compile every
Sass target, autoprefix the top level stylesheets in place, minify the five glob sets, compile the
custom breakpoint templates behind a proxy import swap, then delete the non-minified widget
artifacts.

Two asymmetries are deliberate:

- `--dev` and `--watch` stop after the Sass pass, so dev output is unprefixed and unminified and
  widget CSS is not regenerated.
- Autoprefixer runs over the unminified `assets/css/*.css` only. Nested folders
  (`conditionals/`, `modules/`, `templates/`, `lib/swiper/css/`) are prefixed solely as part
  of minification, so their unminified output carries no vendor prefixes.

## Scripts pipeline

`build-scripts.mjs` builds each entry as its own Rolldown IIFE bundle. There are two entry targets,
`base` and `frontend`, each built in development and production, plus a `qunit` target that emits
only the eight filenames `karma.conf.js` loads. `shared/eicons.mjs` regenerates the committed
`e-icons.js` source module first, since the frontend entries import it.

Three decisions carry the pipeline and are not optional:

- **Babel performs the ES5 downlevel** (`plugins/babel-legacy.mjs`). Rolldown refuses any target
  below ES2015, but the Backbone and Marionette layers depend on ES5 semantics: Backbone's `extend`
  uses an object literal's `constructor` member as the child constructor and reads `.prototype` off
  members such as `Collection#model`, and a shorthand method has neither a `[[Construct]]` slot nor
  a prototype. Targeting ES2020 took Qunit from 261 passing to 70 failing. The bundler still owns
  resolution, tree shaking, externals and minification; only syntax lowering stays with Babel, and
  it costs roughly 4s of the 31s JS build.
- **The two preset sets are asymmetric.** Frontend entries use bare `@babel/preset-env` with
  `useBuiltIns: 'usage'`, everything else uses `@wordpress/default`. The two resolve different
  browser targets, so frontend output legitimately retains arrow functions where base output does
  not.
- **`@babel/plugin-transform-modules-commonjs` is not used.** Rolldown needs ESM to apply externals
  and tree shaking. This is why bundles are smaller than they used to be: `e-wc-product-editor.js`
  fell from 107KB to 6KB, because `@wordpress/element`'s `useState`/`useEffect` collapse to the
  already-external `react` global instead of bundling the whole package.

Base entries inline every dynamic import, since IIFE cannot code split. The frontend entry does
not: `plugins/frontend-chunks.mjs` rewrites each `import( '<first-party>' )` to
`__elementorLoadChunk( '<name>' )` and records the target, and the build then emits each recorded
target as its own IIFE bundle under `assets/js/chunks/`. Doing this only for the frontend targets
the audit that made this necessary: Lighthouse's `unused-javascript` assertion, which measures
what a public page loads on first hit. Base entries load once in wp-admin and are not scored
against the same threshold.

The runtime lives in `assets/dev/js/frontend/utils/chunk-loader.js`. Each chunk registers itself
onto `window.__elementorChunks[ name ]` when its script tag fires `onload`, and `loadChunk` hands
out the same promise for concurrent requests so the tag is appended once. Chunk filenames match
the entry flavor (`<name>.js` or `<name>.min.js`), because the build defines
`__ELEMENTOR_CHUNK_SUFFIX__` from `isProduction` and the loader references it. The
`webpack.runtime[.min].js` placeholders remain, because the `elementor-webpack-runtime` script
handle is still registered in PHP and depended on by `elementor-frontend-modules`.

Chunk names derive from the resolved path rather than the specifier, because two call sites can
import different modules whose basenames collide: `handlers/container/shapes` and
`handlers/section/shapes` become `container-shapes` and `section-shapes` respectively. Webpack
avoided this class of collision through the `webpackChunkName` magic comment; the plugin ignores
those comments deliberately, so the source stays free of build-tool metadata.

`plugins/frontend-chunks.mjs` runs with `enforce: 'pre'`, because `babel-legacy.mjs` also runs
pre, and `@babel/plugin-transform-runtime` had already compiled `import()` down to
`Promise.resolve().then( () => require() )` by the time the chunks plugin saw the code, at which
point the specifier was no longer statically recoverable.

Two failure modes remain that the bundler reports at no log level, so `shared/verify-bundles.mjs`
still fails the build on both. Each one silently removed a feature that a filename and size
comparison could not see, because the entry was still emitted and merely smaller.

- **A specifier written as a template literal is not resolved**, even with no interpolation, and
  the target is dropped. `lightbox-manager.js` lost the entire Lightbox module this way; only a
  test that opened a lightbox caught it. The guard checks that no static `import()` survives
  anywhere under `assets/js/`, including chunks.
- **A dynamic import of an external is left as a bare specifier**, which the browser cannot
  resolve, so the promise rejects. `plugins/dynamic-externals.mjs` rewrites these to
  `Promise.resolve( <global> )`, which is what the external already is; Webpack did the same.

Externals arrive as IIFE arguments and so are read before the bundle body runs, which means a bundle
cannot consume a global it publishes itself. `app-packages` was invoked as
`(React, wp.i18n, elementorAppPackages.router)` and threw before reaching the assignment on its own
first line, leaving the whole App with an empty root. Webpack tolerated the cycle because its
externals were dereferenced lazily on first require. `SELF_PUBLISHED_REQUESTS` in
`shared/externals.mjs` keeps such a request bundled instead, which is equivalent rather than a
workaround: `app/assets/js/router.js` exports the very singleton it assigns to
`elementorAppPackages.router`, with a comment saying so.

`plugins/webpack-shims.mjs` neutralises `assets/dev/js/public-path.js`, which assigns the
`__webpack_public_path__` free variable that no longer exists. Left in place the assignment threw a
`ReferenceError` that aborted the rest of the frontend entry before
`window.elementorFrontend = new Frontend()`, surfacing only as "The preview could not be loaded" in
the editor with no console error on the editor page itself.

Two source files carried latent bugs that only became build failures once the bundler started
validating named imports against a package's real exports:

- `assets/dev/js/editor/utils/helpers.js` imported `isValidAttribute` as a named export of
  `dompurify`, which only exposes it as an instance member.
- `core/common/modules/events-manager/assets/js/module.js` imported the `Mixpanel` type as a value
  from `mixpanel-browser`, using it only in a JSDoc annotation.

## Packages pipeline

`build-packages.mjs` builds the 55 `elementorV2` libraries into
`assets/js/packages/<name>/<name>[.min].js`. It reimplements what the four Webpack plugins under
`packages/packages/tools` did; those packages are still published for external consumers, but Core no
longer builds with them. Entries are discovered by scanning `packages/packages/core`,
`packages/packages/libs` and `packages/apps`, plus `ui` and `icons` from node_modules.

- **Production consumes `dist/index.mjs`, not the CommonJS `dist/index.js`.** Rolldown cannot
  externalize a `require()`, so every dependency would be bundled and `.asset.php` would list no deps
  at all. All 53 packages that ship `dist/index.js` also ship the ESM `dist/index.mjs` built from the
  same sources.
- **The `window.elementorV2` assignment is written explicitly**
  (`plugins/packages-library-entry.mjs`). Given a dotted `output.name`, Rolldown's IIFE emits the
  namespace guard but never assigns the entry's exports to the leaf, so the library would be
  undefined. A generated entry module performs the assignment instead, and no output name is used.
- **`react-dom` reaches the dependency list through the CommonJS rewriter.** `v4-activation-modal`
  imports `react-dom/client`, which is not itself mapped and so gets bundled; its inner
  `require( 'react-dom' )` is what needs the global. `plugins/cjs-externals.mjs` reports the
  requests it rewires so `.asset.php` can include them.

TypeScript and JSX are handled by esbuild rather than Babel, since the packages need only type
stripping and JSX compilation with no downlevel. JSX uses the **classic** runtime
(`React.createElement`/`React.Fragment`), which is what `@babel/preset-react` 7.x still defaults to
and what the packages depend on: `React` resolves to the external global rather than to a bundled
`react/jsx-runtime`. The development build additionally runs `@emotion/babel-plugin` for readable
class names.

## Plugin tree

`assemble-plugin.mjs` empties `build/` and copies the distributable file set into it, listed in
`shared/plugin-files.mjs`.

That list is order dependent and the implementation honours it: a positive pattern adds matches and a
negative pattern removes them, so the last pattern to match a path wins. The trailing positive
entries re-include the parts of `vendor` and `core/files/assets` that broad exclusions above them had
removed. Directories that are excluded with no later re-inclusion are pruned before the scan;
`vendor` and `core/**/assets` deliberately are not.

Two things the old `grunt build` did have no counterpart here. `usebanner` always wrote to files that
`scripts` and `styles` overwrote in the same concurrent block, so no shipped file ever carried the
banner. `checktextdomain` duplicated the `WordPress.WP.I18n` sniff that `ruleset.xml` already
configures with the same `elementor` text domain, and the test environment setup script had been
skipping it for years to avoid its warnings.

A full `npm run build` produces all four trees in about 43s.

## Build mode

Both pipelines set `mode` and define `process.env.NODE_ENV` from the target. This is not cosmetic:
without it the bundler resolves production `exports` conditions in the development build too, so
`@elementor/ui` pulled in React's production JSX runtime and the unminified bundles lost the
development warnings they exist to provide. It surfaced as a React "unique key" warning and as
`ui.js` carrying no `jsxDEV` reference at all.

## Verification

Against a live site, with the whole tree built by `npm run build` and no test modified:

| Check | Result |
|-------|--------|
| Jest (main) | 800/800 |
| Jest (packages) | 3656 passed, 20 skipped |
| Karma / Qunit | 261/261 |
| Editor | panel and widget list render, preview handshake live, 34 `elementorV2` globals with none broken, 0 console errors, 0 failed requests |
| Frontend | `elementorFrontend` initialised, 0 console errors, 0 failed requests |
| wp-admin sweep | dashboard, settings, tools, post list and Gutenberg all clean |

Two results need context:

- The `entry-initialization-webpack-plugin` and `extract-i18n-wordpress-expressions-webpack-plugin`
  suites compile with real Webpack and exceed Jest's 5s timeout when the machine is loaded. They run
  in about 340ms in isolation.
- The admin pages request `assets/js/locales/en/*.json`, which 404. Those files are not produced by
  the build, are not in the repository, and 404 on the old toolchain too.

Every check above was also run against the old Grunt output and matched, which is how the mode issue
was found: the old build reported 0 console errors where the new one reported 1.

## Parity harness

Kept for future changes to the build. Snapshot before a change, snapshot after, then diff.

| Command | Description |
|---------|-------------|
| `npm run build:baseline` | Build styles and scripts, snapshot to `.build-baseline/` |
| `npm run build:baseline:full` | Full build, snapshot assets plus the `build/` tree |
| `npm run build:snapshot` | Snapshot current output to `.build-candidate/` without building |
| `npm run build:compare` | Diff `.build-baseline/` against `.build-candidate/` |

Structural parity (file existence) is enforced on every tree. Content parity is enforced
byte-for-byte on `.css`, `.asset.php`, `.json` and `.strings.js` after stripping banners and
`sourceMappingURL` comments. JS bundles are size-checked only, since bundlers legitimately emit
different module wrappers. Hashed `.bundle` chunks, source maps and `.LICENSE.txt` sidecars are not
compared.

## Things that surprise people

- **No banner is emitted, and none ever was.** The old `usebanner` task wrote to files that were
  being overwritten in the same concurrent block, so zero shipped `.js` or `.css` files carried it.
- **core-js polyfills land in frontend entries only**, injected by `@babel/preset-env` with
  `useBuiltIns: 'usage'`: `es.array.push`, `es.iterator.*`, `esnext.iterator.*` and
  `web.dom-exception.stack`. The iterator helpers are the only ones not natively available across the
  `.browserslistrc` range, and they appear because Babel cannot prove that `.map()`/`.filter()`
  receivers are arrays, not because the source uses iterator helpers.
- **Output volume.** 432 files under `assets/js` including 55 package directories, 236 under
  `assets/css`, and `assets/data/responsive-widgets.json`.
