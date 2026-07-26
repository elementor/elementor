#!/usr/bin/env node

import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { createFrontendIconsFile } from '../shared/eicons.mjs';
import { runBuildTarget } from './create-config.mjs';
import { copyLegacyJsArtifacts, copyLegacyPackageArtifacts } from './shared/legacy-artifacts.mjs';
import { VITE_JS_OUTPUT } from './shared/paths.mjs';

const isWatch = process.argv.includes( '--watch' );

const TARGETS = [ 'base', 'frontend', 'packages' ];

async function buildTarget( label, isProduction, { watch = false } = {} ) {
	console.log( `[vite:scripts] Building ${ label } (${ isProduction ? 'production' : 'development' })${ watch ? ' [watch]' : '' }...` );
	return runBuildTarget( label, isProduction, { watch } );
}

async function buildAllProduction() {
	createFrontendIconsFile();

	for ( const label of TARGETS ) {
		await buildTarget( label, false );
		await buildTarget( label, true );
	}
}

async function startWatchMode() {
	createFrontendIconsFile();

	const watchers = [];

	for ( const label of TARGETS ) {
		const targetWatchers = await buildTarget( label, false, { watch: true } );

		if ( Array.isArray( targetWatchers ) ) {
			watchers.push( ...targetWatchers.filter( Boolean ) );
		}
	}

	console.log( `[vite:scripts] Watching ${ watchers.length } bundles for changes. Press Ctrl+C to stop.` );

	const stop = () => {
		console.log( '\n[vite:scripts] Stopping watchers...' );
		for ( const watcher of watchers ) {
			try {
				watcher.close?.();
			} catch ( error ) {
				console.error( '[vite:scripts] Failed to close watcher:', error );
			}
		}
		process.exit( 0 );
	};

	process.on( 'SIGINT', stop );
	process.on( 'SIGTERM', stop );
}

export async function buildScripts() {
	if ( existsSync( VITE_JS_OUTPUT ) ) {
		rmSync( VITE_JS_OUTPUT, { recursive: true, force: true } );
	}

	mkdirSync( VITE_JS_OUTPUT, { recursive: true } );

	if ( isWatch ) {
		await startWatchMode();
		return;
	}

	await buildAllProduction();

	copyLegacyPackageArtifacts();
	copyLegacyJsArtifacts();
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	buildScripts().catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
}
