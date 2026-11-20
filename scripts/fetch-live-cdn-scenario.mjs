import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const CDN_ORIGIN = 'https://assets.elementor.com';
const LIVE_SCENARIO_DIR = resolve( dirname( fileURLToPath( import.meta.url ) ), '../tests/playwright/mu-plugins/editor-assets-cdn/live' );
const HTTP_NOT_FOUND = 404;

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

const { values: { from: source = CDN_ORIGIN } } = parseArgs( { options: { from: { type: 'string' } } } );
const isUrl = /^https?:\/\//.test( source );

const readFromUrl = async ( path ) => {
	const response = await fetch( `${ source.replace( /\/$/, '' ) }/${ path }`, { cache: 'no-store' } );

	if ( HTTP_NOT_FOUND === response.status ) {
		return null;
	}

	if ( ! response.ok ) {
		throw new Error( `${ source } answered ${ response.status } for ${ path }` );
	}

	return response.json();
};

const readFromDir = async ( path ) => {
	const file = resolve( source, path );

	return existsSync( file ) ? JSON.parse( await readFile( file, 'utf8' ) ) : null;
};

const copyCdnFile = async ( path ) => {
	const json = await ( isUrl ? readFromUrl( path ) : readFromDir( path ) );

	if ( null === json ) {
		console.warn( `Missing in ${ source }, the default scenario answers instead: ${ path }` );
		return;
	}

	const target = resolve( LIVE_SCENARIO_DIR, path );

	await mkdir( dirname( target ), { recursive: true } );
	await writeFile( target, JSON.stringify( json, null, '\t' ) + '\n' );
	console.log( `Saved ${ path }` );
};

await rm( LIVE_SCENARIO_DIR, { recursive: true, force: true } );
await mkdir( LIVE_SCENARIO_DIR, { recursive: true } );
await Promise.all( CDN_PATHS.map( copyCdnFile ) );
