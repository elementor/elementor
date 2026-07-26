#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import { runCheckTextDomain } from '../check-textdomain.mjs';
import { assemblePlugin, applyBannerToAssets } from './assemble-plugin.mjs';
import { buildScripts } from './build-scripts.mjs';
import { buildStyles } from './build-styles.mjs';
import { VITE_CSS_OUTPUT, VITE_JS_OUTPUT } from './shared/paths.mjs';

async function main() {
	console.log( '[vite] Starting build...' );
	await Promise.all( [
		buildStyles(),
		runCheckTextDomain(),
	] );
	await buildScripts();
	applyBannerToAssets( VITE_JS_OUTPUT );
	applyBannerToAssets( VITE_CSS_OUTPUT );
	await assemblePlugin();
	console.log( '[vite] Build completed. Output: build/' );
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	main().catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
}
