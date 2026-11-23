#!/usr/bin/env node
/**
 * Setup CDN fixtures for local Playwright testing.
 *
 * This script:
 * 1. Fetches shared no-promotion fixtures from the shared action repo
 * 2. Fetches live CDN data to test current campaigns
 *
 * Usage: node scripts/setup-cdn-fixtures.mjs [--skip-live]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const FIXTURES_BASE = resolve( __dirname, '../tests/playwright/mu-plugins/editor-assets-cdn' );
const ACTION_SHA = '193fe6eeabd83bdd4cea5b630be3cee58b11aa2c';
const CDN_ORIGIN = 'https://assets.elementor.com';
const SHARED_SCENARIOS = [ 'no-promotion', 'active-campaign' ];

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
];

const { values: { 'skip-live': skipLive = false } } = parseArgs( {
	options: { 'skip-live': { type: 'boolean' } },
} );

const fetchJson = async ( url ) => {
	const response = await fetch( url, { cache: 'no-store' } );
	if ( ! response.ok ) {
		throw new Error( `Failed to fetch ${ url }: ${ response.status }` );
	}
	return response.json();
};

const saveFile = async ( path, content ) => {
	await mkdir( dirname( path ), { recursive: true } );
	await writeFile( path, 'string' === typeof content ? content : JSON.stringify( content, null, '\t' ) + '\n' );
};

for ( const scenario of SHARED_SCENARIOS ) {
	console.log( `📦 Fetching shared ${ scenario } fixtures from action repo...` );
	for ( const path of CDN_PATHS ) {
		const url = `https://raw.githubusercontent.com/elementor/elementor-editor-github-actions/${ ACTION_SHA }/actions/fetch-cdn-scenario/fixtures/${ scenario }/${ path }`;
		try {
			const json = await fetchJson( url );
			const target = resolve( FIXTURES_BASE, scenario, path );
			await saveFile( target, json );
			console.log( `  ✓ ${ scenario }/${ path }` );
		} catch ( error ) {
			console.warn( `  ⚠ Skipped ${ scenario }/${ path }: ${ error.message }` );
		}
	}
}

if ( ! skipLive ) {
	console.log( '\n🌐 Fetching live CDN data...' );
	for ( const path of CDN_PATHS ) {
		try {
			const json = await fetchJson( `${ CDN_ORIGIN }/${ path }` );
			const target = resolve( FIXTURES_BASE, 'live', path );
			await saveFile( target, json );
			console.log( `  ✓ ${ path }` );
		} catch ( error ) {
			console.warn( `  ⚠ Skipped ${ path }: ${ error.message }` );
		}
	}
}

console.log( '\n✅ CDN fixtures setup complete!' );
console.log( skipLive ? '   Run without --skip-live to fetch live CDN data.' : '' );
