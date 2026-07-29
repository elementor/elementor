#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import { assemblePlugin } from './assemble-plugin.mjs';
import { buildPackages } from './build-packages.mjs';
import { buildScripts } from './build-scripts.mjs';
import { buildStyles } from './build-styles.mjs';

/**
 * Equivalent of `grunt build`: produce every asset, then assemble the distributable plugin tree.
 *
 * `grunt build` also ran `i18n` and `usebanner` in the same concurrent block. `usebanner` is
 * omitted deliberately: it targeted the same files `scripts` and `styles` were writing, so its
 * output was always overwritten and no shipped file has ever carried the banner.
 */
export async function buildAll() {
	await buildStyles( {} );
	await buildScripts( { targets: [ 'base', 'frontend' ], watch: false, devOnly: false, clean: true } );
	await buildPackages( {} );

	assemblePlugin();
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	buildAll().catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
}
