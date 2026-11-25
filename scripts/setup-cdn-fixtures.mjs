#!/usr/bin/env node
/**
 * Setup CDN fixtures for local Playwright testing, the same way CI does with the fetch-cdn-scenario action.
 *
 * This script:
 * 1. Downloads the shared no-promotion and active-campaign fixtures from the pinned action commit
 * 2. Fetches the live CDN into the `live` scenario with the action's own fetch script
 *
 * Usage: node scripts/setup-cdn-fixtures.mjs [--skip-live]
 */
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const FIXTURES_BASE = resolve( __dirname, '../tests/playwright/mu-plugins/editor-assets-cdn' );
// Keep in sync with the fetch-cdn-scenario action pinned in the workflows.
const ACTION_SHA = '2844c6e9cadd7bd338fc06afaf331471ac85a6c4';
const ACTION_BASE_URL = `https://raw.githubusercontent.com/elementor/elementor-editor-github-actions/${ ACTION_SHA }/actions/fetch-cdn-scenario`;
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
 * @return {Promise<string | null>} The body, or null when the file does not exist.
 */
const fetchText = async ( url ) => {
	const response = await fetch( url, { cache: 'no-store', signal: AbortSignal.timeout( REQUEST_TIMEOUT_MS ) } );

	if ( HTTP_NOT_FOUND === response.status ) {
		return null;
	}

	if ( ! response.ok ) {
		throw new Error( `${ url } answered ${ response.status }` );
	}

	return response.text();
};

const saveFile = async ( path, content ) => {
	await mkdir( dirname( path ), { recursive: true } );
	await writeFile( path, content );
};

for ( const scenario of SHARED_SCENARIOS ) {
	console.log( `Downloading the shared ${ scenario } fixtures...` );

	await rm( resolve( FIXTURES_BASE, scenario ), { recursive: true, force: true } );

	for ( const path of CDN_PATHS ) {
		const json = await fetchText( `${ ACTION_BASE_URL }/fixtures/${ scenario }/${ path }` );

		if ( null === json ) {
			continue;
		}

		await saveFile( resolve( FIXTURES_BASE, scenario, path ), json );
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
			throw new Error( `The action at ${ ACTION_SHA } has no fetch-cdn-scenario.mjs` );
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
