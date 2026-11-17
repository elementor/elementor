import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const fetchCdnFile = async ( path ) => {
	const response = await fetch( `${ CDN_ORIGIN }/${ path }`, { cache: 'no-store' } );

	if ( HTTP_NOT_FOUND === response.status ) {
		console.warn( `Not on the CDN, the default scenario answers instead: ${ path }` );
		return;
	}

	if ( ! response.ok ) {
		throw new Error( `CDN answered ${ response.status } for ${ path }` );
	}

	const json = await response.json();
	const target = resolve( LIVE_SCENARIO_DIR, path );

	await mkdir( dirname( target ), { recursive: true } );
	await writeFile( target, JSON.stringify( json, null, '\t' ) + '\n' );
	console.log( `Saved ${ path }` );
};

await rm( LIVE_SCENARIO_DIR, { recursive: true, force: true } );
await Promise.all( CDN_PATHS.map( fetchCdnFile ) );
