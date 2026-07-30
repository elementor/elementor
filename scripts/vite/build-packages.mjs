#!/usr/bin/env node

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build as viteBuild, defineConfig } from 'vite-plus';

import { cjsExternalsPlugin } from './plugins/cjs-externals.mjs';
import { i18nStringsPlugin } from './plugins/i18n-strings.mjs';
import { LIBRARY_ENTRY_ID, packagesLibraryEntryPlugin } from './plugins/packages-library-entry.mjs';
import { emotionBabelPlugin, typescriptPlugin } from './plugins/packages-transform.mjs';
import { wordpressAssetFilePlugin } from './plugins/wordpress-asset-file.mjs';
import {
	isPackageExternal,
	kebabToCamelCase,
	resolvePackageGlobal,
} from './shared/packages-externals.mjs';
import { getPackageEntries, PACKAGES_OUTPUT_DIR } from './shared/packages.mjs';
import { verifyNoNodeInterop } from './shared/verify-bundles.mjs';

const RESOLVE_EXTENSIONS = [ '.tsx', '.ts', '.js', '.jsx', '.mjs' ];

/**
 * Class and function names are load bearing across the packages: the editor branches on
 * `constructor.name` in several places, and Emotion derives component labels from them.
 */
const MINIFY_OPTIONS = {
	mangle: { keepNames: true },
	compress: { keepNames: { function: true, class: true } },
};

function createPackageConfig( { name, path: entryPath }, isProduction, watch ) {
	const globalName = kebabToCamelCase( name );

	// Requests reached only through a CommonJS `require()` never surface as chunk imports, so the
	// rewriter reports them and they are folded into the dependency list.
	const cjsRequests = new Set();

	const plugins = [
		packagesLibraryEntryPlugin( { entryPath, globalName } ),
		typescriptPlugin(),
		cjsExternalsPlugin( {
			resolve: resolvePackageGlobal,
			onExternal: ( request ) => cjsRequests.add( request ),
		} ),
		wordpressAssetFilePlugin( {
			entryName: name,
			entryHandle: `elementor-v2-${ name }`,
			outputDir: resolve( PACKAGES_OUTPUT_DIR, name ),
			extraRequests: cjsRequests,
		} ),
	];

	if ( isProduction ) {
		plugins.push( i18nStringsPlugin( {
			entryName: name,
			outputDir: resolve( PACKAGES_OUTPUT_DIR, name ),
			scanPattern: resolve( entryPath, '../../src/**/*.{ts,tsx,js,jsx}' ),
		} ) );
	} else {
		plugins.push( emotionBabelPlugin() );
	}

	return defineConfig( {
		logLevel: 'error',
		// Mirrors Webpack's `mode`, which decided both the `process.env.NODE_ENV` replacement and
		// which `exports` condition of a dependency was resolved.
		mode: isProduction ? 'production' : 'development',
		define: {
			'process.env.NODE_ENV': JSON.stringify( isProduction ? 'production' : 'development' ),
		},
		plugins,
		resolve: { extensions: RESOLVE_EXTENSIONS },
		build: {
			outDir: resolve( PACKAGES_OUTPUT_DIR, name ),
			emptyOutDir: false,
			// Development keeps readable output and real source maps, matching `mode: 'development'`
			// with `optimization.minimize: false`; production emits no maps at all.
			sourcemap: ! isProduction,
			minify: false,
			watch: watch ? {} : null,
			rollupOptions: {
				input: { [ name ]: LIBRARY_ENTRY_ID },
				external: ( id ) => isPackageExternal( id ),
				output: {
					format: 'iife',
					entryFileNames: isProduction ? `${ name }.min.js` : `${ name }.js`,
					keepNames: true,
					minify: isProduction ? MINIFY_OPTIONS : false,
					globals: ( id ) => resolvePackageGlobal( id ) ?? undefined,
					// `EntryInitializationWebpackPlugin` appended this to every entry so each
					// library can opt into an `init()` that runs as soon as it is registered.
					footer: `window.elementorV2.${ globalName }?.init?.();`,
				},
			},
		},
	} );
}

function resolveModes( { devOnly, prodOnly, watch } ) {
	// Watching only makes sense against the TypeScript sources, which is also what Webpack's
	// development config consumed.
	if ( devOnly || watch ) {
		return [ false ];
	}

	return prodOnly ? [ true ] : [ false, true ];
}

export async function buildPackages( { devOnly = false, prodOnly = false, watch = false } = {} ) {
	const modes = resolveModes( { devOnly, prodOnly, watch } );
	const watchers = [];

	for ( const isProduction of modes ) {
		const entries = getPackageEntries( isProduction ? 'dist' : 'src' );
		const startedAt = Date.now();

		for ( const entry of entries ) {
			const result = await viteBuild( createPackageConfig( entry, isProduction, watch ) );

			if ( watch ) {
				watchers.push( result );
			}
		}

		const mode = isProduction ? 'production' : 'development';
		console.log( `[vite:packages] ${ mode }: ${ entries.length } entries in ${ Date.now() - startedAt }ms` );
	}

	if ( ! watch ) {
		verifyNoNodeInterop( PACKAGES_OUTPUT_DIR );
		return;
	}

	console.log( `[vite:packages] Watching ${ watchers.length } bundles. Press Ctrl+C to stop.` );

	const stop = () => {
		for ( const watcher of watchers ) {
			watcher?.close?.();
		}
		process.exit( 0 );
	};

	process.on( 'SIGINT', stop );
	process.on( 'SIGTERM', stop );
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	const argv = process.argv.slice( 2 );

	buildPackages( {
		devOnly: argv.includes( '--dev' ),
		prodOnly: argv.includes( '--prod' ),
		watch: argv.includes( '--watch' ),
	} ).catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
}
