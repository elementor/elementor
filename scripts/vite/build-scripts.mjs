#!/usr/bin/env node

import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build as viteBuild } from 'vite-plus';

import { createChunkConfig, createEntryConfig, CHUNKS_OUTPUT_DIR } from './create-config.mjs';
import { generateEiconsFile } from './shared/eicons.mjs';
import { BASE_ENTRIES, FRONTEND_ENTRIES, QUNIT_ENTRIES } from './shared/entries.mjs';
import { ASSETS_JS } from './shared/paths.mjs';
import { verifyNoUnresolvedImports, verifySelfPublishedGlobals } from './shared/verify-bundles.mjs';

/**
 * The Webpack runtime chunk has no equivalent once every entry is self-contained, but the
 * `elementor-webpack-runtime` script handle is still registered in PHP and depended on by
 * `elementor-frontend-modules`, so a no-op file keeps the enqueue graph resolvable.
 */
const RUNTIME_PLACEHOLDER_NAMES = [ 'webpack.runtime.js', 'webpack.runtime.min.js' ];
const RUNTIME_PLACEHOLDER_SOURCE = '/* Elementor bundles are self-contained; this file exists for the elementor-webpack-runtime handle. */\n';

const TARGETS = {
	base: { entries: BASE_ENTRIES, emitStrings: true },
	frontend: { entries: FRONTEND_ENTRIES, emitStrings: false, isFrontend: true },
	qunit: { entries: QUNIT_ENTRIES, emitStrings: false },
};

function parseArgs( argv ) {
	const requested = argv.filter( ( arg ) => ! arg.startsWith( '--' ) );

	return {
		watch: argv.includes( '--watch' ),
		devOnly: argv.includes( '--dev' ) || argv.includes( '--watch' ),
		prodOnly: argv.includes( '--prod' ),
		clean: ! argv.includes( '--no-clean' ),
		targets: requested.length ? requested : [ 'base', 'frontend' ],
	};
}

/**
 * `assets/js` is generated output and is not in the repository, so on a clean checkout it does not
 * exist yet. Only the bundles at the top level are removed; the `packages/` subdirectory is owned by
 * the packages build.
 */
function cleanBundleOutput() {
	mkdirSync( ASSETS_JS, { recursive: true } );

	for ( const fileName of readdirSync( ASSETS_JS ) ) {
		const fullPath = join( ASSETS_JS, fileName );

		if ( statSync( fullPath ).isFile() ) {
			rmSync( fullPath, { force: true } );
		}
	}
}

function writeRuntimePlaceholders() {
	mkdirSync( ASSETS_JS, { recursive: true } );

	for ( const fileName of RUNTIME_PLACEHOLDER_NAMES ) {
		writeFileSync( join( ASSETS_JS, fileName ), RUNTIME_PLACEHOLDER_SOURCE );
	}
}

/**
 * The `frontend` entry (not the target of the same name; see FRONTEND_ENTRIES) is the one that
 * uses `import()` to lazy-load per-widget handlers. Every chunk it discovers is built after the
 * entry itself and lands in `assets/js/chunks/` for `utils/chunk-loader.js` to fetch on demand.
 */
const CHUNKED_ENTRY_NAME = 'frontend';

function cleanChunksOutput() {
	mkdirSync( CHUNKS_OUTPUT_DIR, { recursive: true } );

	for ( const fileName of readdirSync( CHUNKS_OUTPUT_DIR ) ) {
		rmSync( join( CHUNKS_OUTPUT_DIR, fileName ), { force: true } );
	}
}

async function buildFrontendChunks( { chunks, isProduction, watch } ) {
	const watchers = [];

	for ( const [ chunkName, entryPath ] of chunks ) {
		const result = await viteBuild( createChunkConfig( { chunkName, entryPath, isProduction, watch } ) );

		if ( watch ) {
			watchers.push( result );
		}
	}

	return watchers;
}

async function buildTarget( targetName, { isProduction, watch } ) {
	const target = TARGETS[ targetName ];

	if ( ! target ) {
		throw new Error( `Unknown build target "${ targetName }". Expected one of: ${ Object.keys( TARGETS ).join( ', ' ) }` );
	}

	const watchers = [];
	const entryNames = Object.keys( target.entries );
	const startedAt = Date.now();
	const chunks = new Map();

	for ( const entryName of entryNames ) {
		const result = await viteBuild( createEntryConfig( {
			entryName,
			entry: target.entries[ entryName ],
			isProduction,
			watch,
			emitStrings: target.emitStrings && isProduction,
			isFrontend: Boolean( target.isFrontend ),
			chunkEntries: ( target.isFrontend && entryName === CHUNKED_ENTRY_NAME ) ? chunks : null,
		} ) );

		if ( watch ) {
			watchers.push( result );
		}
	}

	const mode = isProduction ? 'production' : 'development';
	console.log( `[vite:scripts] ${ targetName } (${ mode }): ${ entryNames.length } entries in ${ Date.now() - startedAt }ms` );

	if ( chunks.size ) {
		const chunkStart = Date.now();
		const chunkWatchers = await buildFrontendChunks( { chunks, isProduction, watch } );

		watchers.push( ...chunkWatchers );
		console.log( `[vite:scripts] ${ targetName } (${ mode }): ${ chunks.size } chunks in ${ Date.now() - chunkStart }ms` );
	}

	return watchers;
}

function resolveModes( { devOnly, prodOnly } ) {
	if ( devOnly ) {
		return [ false ];
	}

	return prodOnly ? [ true ] : [ false, true ];
}

export async function buildScripts( { targets, watch, devOnly, prodOnly, clean } ) {
	if ( clean && ! watch ) {
		cleanBundleOutput();
		cleanChunksOutput();
	}

	// The frontend entries import the generated icon module, so it has to exist before bundling.
	generateEiconsFile();

	const watchers = [];
	const modes = resolveModes( { devOnly, prodOnly } );

	for ( const targetName of targets ) {
		for ( const isProduction of modes ) {
			watchers.push( ...await buildTarget( targetName, { isProduction, watch } ) );
		}
	}

	writeRuntimePlaceholders();

	if ( ! watch ) {
		verifyNoUnresolvedImports();
		verifySelfPublishedGlobals();
		return;
	}

	console.log( `[vite:scripts] Watching ${ watchers.length } bundles. Press Ctrl+C to stop.` );

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
	buildScripts( parseArgs( process.argv.slice( 2 ) ) ).catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
}
