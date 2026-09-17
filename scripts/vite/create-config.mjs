import { join } from 'node:path';

import { defineConfig } from 'vite-plus';

import { appScssPlugin } from './plugins/app-scss.mjs';
import { babelLegacyPlugin } from './plugins/babel-legacy.mjs';
import { CHUNK_ENTRY_ID, chunkEntryPlugin } from './plugins/chunk-entry.mjs';
import { cjsExternalsPlugin } from './plugins/cjs-externals.mjs';
import { dynamicExternalsPlugin } from './plugins/dynamic-externals.mjs';
import { frontendChunksPlugin } from './plugins/frontend-chunks.mjs';
import { i18nStringsPlugin } from './plugins/i18n-strings.mjs';
import { MULTI_SOURCE_ENTRY_ID, multiSourceEntryPlugin } from './plugins/multi-source-entry.mjs';
import { webpackShimsPlugin } from './plugins/webpack-shims.mjs';
import { loadAliases } from './shared/aliases.mjs';
import { isExternal, resolveGlobal, SELF_PUBLISHED_ALIASES } from './shared/externals.mjs';
import { toEntrySources, withProductionSuffix } from './shared/entries.mjs';
import { ASSETS_JS } from './shared/paths.mjs';

/**
 * Where the on-demand chunks land. The runtime in `utils/chunk-loader.js` constructs URLs of the
 * form `<assets>/js/chunks/<name>[.min].js`, so both the output directory and the filename suffix
 * have to agree between build and runtime.
 */
export const CHUNKS_OUTPUT_DIR = join( ASSETS_JS, 'chunks' );

/**
 * Babel has already lowered first-party code to ES5, so this only governs the third-party
 * dependencies the bundler pulls in. ES2015 is the floor Rolldown accepts.
 */
const BUILD_TARGET = 'es2015';

/**
 * The two preset sets are deliberately asymmetric. Frontend entries resolve a wider browser range
 * and inject core-js polyfills; every other entry uses the WordPress default preset, which does not
 * polyfill. This is why frontend output legitimately retains arrow functions where base output
 * does not.
 */
const BASE_PRESETS = [ '@wordpress/default' ];
const FRONTEND_PRESETS = [ [ '@babel/preset-env', { useBuiltIns: 'usage', corejs: '3.23' } ] ];

/**
 * Globals the sources use without importing, which the Webpack `ProvidePlugin` supplied.
 */
const INJECTED_GLOBALS = {
	React: 'react',
	ReactDOM: 'react-dom',
	PropTypes: 'prop-types',
	__: [ '@wordpress/i18n', '__' ],
	sprintf: [ '@wordpress/i18n', 'sprintf' ],
};

const RESOLVE_EXTENSIONS = [ '.js', '.jsx', '.ts', '.tsx', '.json' ];

/**
 * Function and class names must survive minification: module identity, editor event dispatch
 * and `is-instanceof` all branch on `constructor.name` at runtime.
 */
const MINIFY_OPTIONS = {
	mangle: { keepNames: true },
	compress: { keepNames: { function: true, class: true } },
};

function sharedDefines( isProduction ) {
	return {
		'process.env.NODE_ENV': JSON.stringify( isProduction ? 'production' : 'development' ),
		// Read at runtime by `assets/dev/js/frontend/utils/chunk-loader.js` to pick the file suffix
		// that matches its own build flavor: a dev entry loads dev chunks, prod loads minified ones.
		__ELEMENTOR_CHUNK_SUFFIX__: JSON.stringify( isProduction ? '.min' : '' ),
	};
}

export function createEntryConfig( {
	entryName,
	entry,
	isProduction,
	watch = false,
	outputDir = ASSETS_JS,
	emitStrings = false,
	isFrontend = false,
	chunkEntries = null,
} ) {
	const sources = toEntrySources( entry );
	const outputName = isProduction ? withProductionSuffix( entryName ) : entryName;
	const inputId = sources.length > 1 ? MULTI_SOURCE_ENTRY_ID : sources[ 0 ];

	const resolveBundleGlobal = ( request ) => resolveGlobal( request, entryName );

	const plugins = [
		multiSourceEntryPlugin( { sources } ),
		webpackShimsPlugin(),
	];

	// The `frontend` entry runs the loader instead of inlining, so the plugin only attaches when a
	// chunk collector was provided. Other frontend entries (small per-widget handlers) have no
	// `import()` calls and are still bundled as a single IIFE. This has to run before Babel,
	// because `@babel/plugin-transform-dynamic-import` compiles `import()` down to
	// `Promise.resolve().then(() => require())` for the frontend's browserslist targets, at which
	// point the specifier is no longer statically recoverable.
	if ( chunkEntries ) {
		plugins.push( frontendChunksPlugin( { chunks: chunkEntries } ) );
	}

	plugins.push(
		babelLegacyPlugin( {
			presets: isFrontend ? FRONTEND_PRESETS : BASE_PRESETS,
			sourcemap: ! isProduction,
		} ),
		appScssPlugin(),
		dynamicExternalsPlugin( { resolve: resolveBundleGlobal } ),
		cjsExternalsPlugin( { resolve: resolveBundleGlobal } ),
	);

	if ( emitStrings ) {
		plugins.push( i18nStringsPlugin( { entryName, entrySourcePath: sources[ 0 ], outputDir } ) );
	}

	return defineConfig( {
		logLevel: process.env.ELEMENTOR_BUILD_VERBOSE ? 'info' : 'error',
		// Mirrors Webpack's `mode`. Without it the bundler would resolve production `exports`
		// conditions in the development build too, pulling in the production React runtime and
		// dropping the development warnings the unminified bundles exist to provide.
		mode: isProduction ? 'production' : 'development',
		define: sharedDefines( isProduction ),
		plugins,
		resolve: {
			alias: { ...loadAliases(), ...SELF_PUBLISHED_ALIASES },
			extensions: RESOLVE_EXTENSIONS,
		},
		build: {
			outDir: outputDir,
			emptyOutDir: false,
			target: BUILD_TARGET,
			minify: false,
			sourcemap: ! isProduction,
			watch: watch ? {} : null,
			rollupOptions: {
				input: { [ outputName ]: inputId },
				external: ( id ) => isExternal( id, entryName ),
				transform: { inject: INJECTED_GLOBALS },
				output: {
					format: 'iife',
					entryFileNames: '[name].js',
					keepNames: true,
					minify: isProduction ? MINIFY_OPTIONS : false,
					globals: ( id ) => resolveGlobal( id, entryName ) ?? undefined,
				},
			},
		},
	} );
}

/**
 * Builds a single chunk as its own IIFE bundle. The chunk shares the frontend externals so it does
 * not re-bundle React or jQuery, and its exports are assigned to `window.__elementorChunks[name]`
 * via the virtual entry that `chunkEntryPlugin` provides.
 */
export function createChunkConfig( { chunkName, entryPath, isProduction, watch = false } ) {
	const outputName = isProduction ? withProductionSuffix( chunkName ) : chunkName;
	const resolveBundleGlobal = ( request ) => resolveGlobal( request, 'frontend' );

	return defineConfig( {
		logLevel: process.env.ELEMENTOR_BUILD_VERBOSE ? 'info' : 'error',
		mode: isProduction ? 'production' : 'development',
		define: sharedDefines( isProduction ),
		plugins: [
			chunkEntryPlugin( { entryPath, chunkName } ),
			webpackShimsPlugin(),
			babelLegacyPlugin( {
				presets: FRONTEND_PRESETS,
				sourcemap: ! isProduction,
			} ),
			appScssPlugin(),
			dynamicExternalsPlugin( { resolve: resolveBundleGlobal } ),
			cjsExternalsPlugin( { resolve: resolveBundleGlobal } ),
		],
		resolve: {
			alias: { ...loadAliases(), ...SELF_PUBLISHED_ALIASES },
			extensions: RESOLVE_EXTENSIONS,
		},
		build: {
			outDir: CHUNKS_OUTPUT_DIR,
			emptyOutDir: false,
			target: BUILD_TARGET,
			minify: false,
			sourcemap: ! isProduction,
			watch: watch ? {} : null,
			rollupOptions: {
				input: { [ outputName ]: CHUNK_ENTRY_ID },
				external: ( id ) => isExternal( id, 'frontend' ),
				transform: { inject: INJECTED_GLOBALS },
				output: {
					format: 'iife',
					entryFileNames: '[name].js',
					keepNames: true,
					minify: isProduction ? MINIFY_OPTIONS : false,
					globals: ( id ) => resolveGlobal( id, 'frontend' ) ?? undefined,
				},
			},
		},
	} );
}
