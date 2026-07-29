import { defineConfig } from 'vite-plus';

import { appScssPlugin } from './plugins/app-scss.mjs';
import { babelLegacyPlugin } from './plugins/babel-legacy.mjs';
import { cjsExternalsPlugin } from './plugins/cjs-externals.mjs';
import { dynamicExternalsPlugin } from './plugins/dynamic-externals.mjs';
import { i18nStringsPlugin } from './plugins/i18n-strings.mjs';
import { MULTI_SOURCE_ENTRY_ID, multiSourceEntryPlugin } from './plugins/multi-source-entry.mjs';
import { webpackShimsPlugin } from './plugins/webpack-shims.mjs';
import { loadAliases } from './shared/aliases.mjs';
import { isExternal, resolveGlobal, SELF_PUBLISHED_ALIASES } from './shared/externals.mjs';
import { toEntrySources, withProductionSuffix } from './shared/entries.mjs';
import { ASSETS_JS } from './shared/paths.mjs';

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

export function createEntryConfig( {
	entryName,
	entry,
	isProduction,
	watch = false,
	outputDir = ASSETS_JS,
	emitStrings = false,
	isFrontend = false,
} ) {
	const sources = toEntrySources( entry );
	const outputName = isProduction ? withProductionSuffix( entryName ) : entryName;
	const inputId = sources.length > 1 ? MULTI_SOURCE_ENTRY_ID : sources[ 0 ];

	const resolveBundleGlobal = ( request ) => resolveGlobal( request, entryName );

	const plugins = [
		multiSourceEntryPlugin( { sources } ),
		webpackShimsPlugin(),
		babelLegacyPlugin( {
			presets: isFrontend ? FRONTEND_PRESETS : BASE_PRESETS,
			sourcemap: ! isProduction,
		} ),
		appScssPlugin(),
		dynamicExternalsPlugin( { resolve: resolveBundleGlobal } ),
		cjsExternalsPlugin( { resolve: resolveBundleGlobal } ),
	];

	if ( emitStrings ) {
		plugins.push( i18nStringsPlugin( { entryName, entrySourcePath: sources[ 0 ], outputDir } ) );
	}

	return defineConfig( {
		logLevel: process.env.ELEMENTOR_BUILD_VERBOSE ? 'info' : 'error',
		// Mirrors Webpack's `mode`. Without it the bundler would resolve production `exports`
		// conditions in the development build too, pulling in the production React runtime and
		// dropping the development warnings the unminified bundles exist to provide.
		mode: isProduction ? 'production' : 'development',
		define: {
			'process.env.NODE_ENV': JSON.stringify( isProduction ? 'production' : 'development' ),
		},
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
