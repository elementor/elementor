#!/usr/bin/env node
/**
 * Setup CDN fixtures for local Playwright testing, the same way CI does with the fetch-cdn-scenario action.
 *
 * This script:
 * 1. Downloads the mock CDN mu-plugin (`mock-editor-assets-cdn.php`) and shared `no-promotion` / `active-campaign` fixtures from the pinned action ref
 * 2. Fetches the live CDN into the `live` scenario with the action's own fetch script
 *
 * Usage: node scripts/setup-cdn-fixtures.mjs [--skip-live]
 */
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const MU_PLUGINS_DIR = resolve( __dirname, '../tests/playwright/mu-plugins' );
const FIXTURES_BASE = resolve( MU_PLUGINS_DIR, 'editor-assets-cdn' );
// The same ref of the fetch-cdn-scenario action as in the workflows.
const ACTION_REF = 'main';
const ACTION_BASE_URL = `https://raw.githubusercontent.com/elementor/elementor-editor-github-actions/${ ACTION_REF }/actions/fetch-cdn-scenario`;
const SHARED_SCENARIOS = [ 'no-promotion', 'active-campaign' ];
const HTTP_NOT_FOUND = 404;
const REQUEST_TIMEOUT_MS = 15000;

// A scenario may leave a file out, the default scenario then answers for it.
const CDN_PATHS = [
	'editor-promotions/v1/connect-page.json',
	'editor-promotions/v1/conversion-banner.json',
	'editor-promotions/v1/plugins-page.json',
	'editor-promotions/v1/pointer.json',
	'editor-promotions/v1/pro-setup-panel.json',
	'editor-promotions/v1/side-menu.json',
	'editor-promotions/v1/sticky-panel.json',
	'editor-promotions/v1/theme-builder.json',
	'notifications/v1/notifications.json',
	'home-screen/v1/home-screen.json',
	'packages/v1/promotions.json',
	'free-to-pro-upsell/v1/free-to-pro-upsell.json',
];

const { values: { 'skip-live': skipLive = false } } = parseArgs( {
	options: { 'skip-live': { type: 'boolean' } },
} );

/**
 * @param {string} url
 * @return {Promise<Response | null>} The response, or null when the file does not exist.
 */
const fetchFile = async ( url ) => {
	const response = await fetch( url, { cache: 'no-store', signal: AbortSignal.timeout( REQUEST_TIMEOUT_MS ) } );

	if ( HTTP_NOT_FOUND === response.status ) {
		return null;
	}

	if ( ! response.ok ) {
		throw new Error( `${ url } answered ${ response.status }` );
	}

	return response;
};

/**
 * @param {string} url
 * @return {Promise<string | null>} The body, or null when the file does not exist.
 */
const fetchText = async ( url ) => ( await fetchFile( url ) )?.text() ?? null;

// The tests answer the browser's CDN image requests from the fixture, so a fixture keeps the images its JSON uses.
const CDN_IMAGE_URL = /https:\/\/assets\.elementor\.com\/([^"?]+\.(?:svg|png|jpe?g|gif|webp))/g;

/**
 * @param {string[]} jsonFiles
 * @return {string[]} The CDN paths of the images that the files use.
 */
const getImagePaths = ( jsonFiles ) => [ ...new Set( jsonFiles.flatMap( ( json ) => [ ...json.matchAll( CDN_IMAGE_URL ) ].map( ( [ , path ] ) => path ) ) ) ];

const saveFile = async ( path, content ) => {
	await mkdir( dirname( path ), { recursive: true } );
	await writeFile( path, content );
};

console.log( 'Downloading mock-editor-assets-cdn.php...' );
const muPlugin = await fetchText( `${ ACTION_BASE_URL }/mock-editor-assets-cdn.php` );

if ( null === muPlugin ) {
	throw new Error( `The action at ${ ACTION_REF } has no mock-editor-assets-cdn.php` );
}

await saveFile( resolve( MU_PLUGINS_DIR, 'mock-editor-assets-cdn.php' ), muPlugin );

for ( const scenario of SHARED_SCENARIOS ) {
	console.log( `Downloading the shared ${ scenario } fixtures...` );

	await rm( resolve( FIXTURES_BASE, scenario ), { recursive: true, force: true } );

	const jsonFiles = [];

	for ( const path of CDN_PATHS ) {
		const json = await fetchText( `${ ACTION_BASE_URL }/fixtures/${ scenario }/${ path }` );

		if ( null === json ) {
			continue;
		}

		jsonFiles.push( json );
		await saveFile( resolve( FIXTURES_BASE, scenario, path ), json );
		console.log( `  ${ scenario }/${ path }` );
	}

	// Most images are not part of the fixture, the browser then loads them from the CDN.
	for ( const path of getImagePaths( jsonFiles ) ) {
		const image = await fetchFile( `${ ACTION_BASE_URL }/fixtures/${ scenario }/${ path }` );

		if ( null === image ) {
			continue;
		}

		await saveFile( resolve( FIXTURES_BASE, scenario, path ), Buffer.from( await image.arrayBuffer() ) );
		console.log( `  ${ scenario }/${ path }` );
	}
}

if ( ! skipLive ) {
	console.log( '\nFetching the live CDN...' );

	const tempDir = await mkdtemp( join( tmpdir(), 'fetch-cdn-scenario-' ) );
	const script = join( tempDir, 'fetch-cdn-scenario.mjs' );

	try {
		const source = await fetchText( `${ ACTION_BASE_URL }/fetch-cdn-scenario.mjs` );

		if ( null === source ) {
			throw new Error( `The action at ${ ACTION_REF } has no fetch-cdn-scenario.mjs` );
		}

		await writeFile( script, source );

		const { status } = spawnSync( process.execPath, [ script, `--output=${ resolve( FIXTURES_BASE, 'live' ) }` ], { stdio: 'inherit' } );

		if ( 0 !== status ) {
			process.exitCode = status ?? 1;
		}
	} finally {
		await rm( tempDir, { recursive: true, force: true } );
	}
}
