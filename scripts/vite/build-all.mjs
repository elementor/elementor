#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import { assemblePlugin } from './assemble-plugin.mjs';
import { buildPackages } from './build-packages.mjs';
import { buildScripts } from './build-scripts.mjs';
import { buildStyles } from './build-styles.mjs';

/**
 * Produces every asset, then assembles the distributable plugin tree.
 *
 * Two steps of the Grunt `build` task have no counterpart here. `usebanner` targeted the same files
 * that `scripts` and `styles` were writing in the same concurrent block, so its output was always
 * overwritten and no shipped file has ever carried the banner. `checktextdomain` duplicated the
 * `WordPress.WP.I18n` sniff that `ruleset.xml` already configures with the same text domain, and the
 * test environment setup script had been skipping it for years to avoid its warnings.
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
