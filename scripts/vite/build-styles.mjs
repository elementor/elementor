#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import { build as viteBuild, defineConfig } from 'vite-plus';

import { scssBuildPlugin, STYLES_VIRTUAL_ENTRY } from './plugins/scss-build.mjs';
import { resolveFromRoot } from './shared/paths.mjs';

/**
 * Stylesheets are written directly to their final locations by the plugin, so the bundle
 * Rolldown produces for the virtual entry is discarded into a scratch directory.
 */
const SCRATCH_OUT_DIR = resolveFromRoot( 'node_modules/.cache/elementor-vite/styles' );

function createStylesConfig( { watch, devMode } ) {
	return defineConfig( {
		logLevel: 'warn',
		plugins: [ scssBuildPlugin( { devMode } ) ],
		build: {
			outDir: SCRATCH_OUT_DIR,
			emptyOutDir: false,
			minify: false,
			sourcemap: false,
			watch: watch ? {} : null,
			rollupOptions: {
				input: { 'styles-entry': STYLES_VIRTUAL_ENTRY },
				output: { format: 'iife', entryFileNames: '[name].js' },
			},
		},
	} );
}

export async function buildStyles( { watch = false, devMode = false } = {} ) {
	const watcher = await viteBuild( createStylesConfig( { watch, devMode } ) );

	if ( ! watch ) {
		return;
	}

	console.log( '[vite:styles] Watching SCSS sources. Press Ctrl+C to stop.' );

	const stop = () => {
		watcher?.close?.();
		process.exit( 0 );
	};

	process.on( 'SIGINT', stop );
	process.on( 'SIGTERM', stop );
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	const watch = process.argv.includes( '--watch' );

	buildStyles( { watch, devMode: watch || process.argv.includes( '--dev' ) } ).catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
}
