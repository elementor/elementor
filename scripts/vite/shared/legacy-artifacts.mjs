import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT, VITE_JS_OUTPUT } from './paths.mjs';
import { getPackageEntries } from './entries.mjs';

export function copyLegacyJsArtifacts() {
	const legacyJsRoot = join( ROOT, 'assets/js' );
	const legacyChunkPattern = /^(webpack\.runtime(\.min)?\.js$|[a-f0-9]{8,}\.bundle(\.min)?\.js$|jszip\.vendor\.|[a-z0-9_-]+\.[A-Za-z0-9_-]+\.bundle(\.min)?\.js$)/;

	if ( ! existsSync( legacyJsRoot ) ) {
		return;
	}

	for ( const fileName of readdirSync( legacyJsRoot ) ) {
		if ( ! legacyChunkPattern.test( fileName ) ) {
			continue;
		}

		const destinationPath = join( VITE_JS_OUTPUT, fileName );

		if ( ! existsSync( destinationPath ) ) {
			cpSync( join( legacyJsRoot, fileName ), destinationPath );
		}
	}
}

export function copyLegacyPackageArtifacts() {
	const builtPackageNames = new Set( getPackageEntries().map( ( entry ) => entry.name ) );
	const legacyPackagesRoot = join( ROOT, 'assets/js/packages' );
	const vitePackagesRoot = join( VITE_JS_OUTPUT, 'packages' );

	if ( ! existsSync( legacyPackagesRoot ) ) {
		return;
	}

	mkdirSync( vitePackagesRoot, { recursive: true } );

	for ( const packageName of readdirSync( legacyPackagesRoot ) ) {
		if ( builtPackageNames.has( packageName ) ) {
			continue;
		}

		const sourcePath = join( legacyPackagesRoot, packageName );
		const destinationPath = join( vitePackagesRoot, packageName );
		cpSync( sourcePath, destinationPath, { recursive: true, force: true } );
	}
}

export function copyLegacySwiperCssArtifacts( cssOutput ) {
	const legacySwiperRoot = join( ROOT, 'assets/lib/swiper/css' );
	const viteSwiperRoot = join( cssOutput, '..', 'lib', 'swiper', 'css' );

	if ( ! existsSync( legacySwiperRoot ) ) {
		return;
	}

	mkdirSync( viteSwiperRoot, { recursive: true } );

	for ( const fileName of readdirSync( legacySwiperRoot ) ) {
		const destinationPath = join( viteSwiperRoot, fileName );

		if ( ! existsSync( destinationPath ) ) {
			cpSync( join( legacySwiperRoot, fileName ), destinationPath );
		}
	}
}
