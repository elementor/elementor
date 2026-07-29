#!/usr/bin/env node

import { readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build as viteBuild } from 'vite-plus';

import { createEntryConfig } from './create-config.mjs';
import { BASE_ENTRIES, FRONTEND_ENTRIES, QUNIT_ENTRIES } from './shared/entries.mjs';
import { ASSETS_JS } from './shared/paths.mjs';

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
		clean: ! argv.includes( '--no-clean' ),
		targets: requested.length ? requested : [ 'base', 'frontend' ],
	};
}

function cleanBundleOutput() {
	for ( const fileName of readdirSync( ASSETS_JS ) ) {
		const fullPath = join( ASSETS_JS, fileName );

		if ( statSync( fullPath ).isFile() ) {
			rmSync( fullPath, { force: true } );
		}
	}
}

function writeRuntimePlaceholders() {
	for ( const fileName of RUNTIME_PLACEHOLDER_NAMES ) {
		writeFileSync( join( ASSETS_JS, fileName ), RUNTIME_PLACEHOLDER_SOURCE );
	}
}

async function buildTarget( targetName, { isProduction, watch } ) {
	const target = TARGETS[ targetName ];

	if ( ! target ) {
		throw new Error( `Unknown build target "${ targetName }". Expected one of: ${ Object.keys( TARGETS ).join( ', ' ) }` );
	}

	const watchers = [];
	const entryNames = Object.keys( target.entries );
	const startedAt = Date.now();

	for ( const entryName of entryNames ) {
		const result = await viteBuild( createEntryConfig( {
			entryName,
			entry: target.entries[ entryName ],
			isProduction,
			watch,
			emitStrings: target.emitStrings && isProduction,
			isFrontend: Boolean( target.isFrontend ),
		} ) );

		if ( watch ) {
			watchers.push( result );
		}
	}

	const mode = isProduction ? 'production' : 'development';
	console.log( `[vite:scripts] ${ targetName } (${ mode }): ${ entryNames.length } entries in ${ Date.now() - startedAt }ms` );

	return watchers;
}

export async function buildScripts( { targets, watch, devOnly, clean } ) {
	if ( clean && ! watch ) {
		cleanBundleOutput();
	}

	const watchers = [];
	const modes = devOnly ? [ false ] : [ false, true ];

	for ( const targetName of targets ) {
		for ( const isProduction of modes ) {
			watchers.push( ...await buildTarget( targetName, { isProduction, watch } ) );
		}
	}

	writeRuntimePlaceholders();

	if ( ! watch ) {
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
