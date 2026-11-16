import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT, resolveFromRoot } from './paths.mjs';

export const FONT_AWESOME_7_RELATIVE_DIR = 'assets/lib/font-awesome-7';

export const FONT_AWESOME_7_JSON_FILES = [ 'brands.json', 'regular.json', 'solid.json' ];

export const FONT_AWESOME_7_SEARCH_INDEX_FILE = 'search-index.json';

export const FONT_AWESOME_7_VERSION_FILE = 'version.json';

export const FONT_AWESOME_7_MAJOR_VERSION = 7;

export const FONT_AWESOME_7_GENERATE_ARGS = [
	'--experimental-strip-types',
	resolveFromRoot( 'packages/packages/tools/generate-font-awesome-7/src/generate.ts' ),
];

const FONT_AWESOME_7_VERSION_PATTERN = new RegExp( `^${ FONT_AWESOME_7_MAJOR_VERSION }\\.` );

export function generateFontAwesome7Catalog( { spawn = spawnSync } = {} ) {
	const result = spawn(
		process.execPath,
		FONT_AWESOME_7_GENERATE_ARGS,
		{
			cwd: ROOT,
			stdio: 'inherit',
		},
	);

	if ( result.error ) {
		throw new Error( `Failed to generate the Font Awesome 7 catalog: ${ result.error.message }` );
	}

	if ( result.signal ) {
		throw new Error( `Failed to generate the Font Awesome 7 catalog: killed by ${ result.signal }` );
	}

	if ( result.status !== 0 ) {
		throw new Error( `Failed to generate the Font Awesome 7 catalog: exited with ${ result.status }` );
	}
}

export function ensureFontAwesome7Catalog( { spawn = spawnSync, catalogRoot = ROOT } = {} ) {
	try {
		verifyFontAwesome7Catalog( catalogRoot );
	} catch {
		generateFontAwesome7Catalog( { spawn } );
	}
}

export function verifyFontAwesome7Catalog( baseDir ) {
	verifyCatalogVersion( baseDir );

	for ( const fileName of FONT_AWESOME_7_JSON_FILES ) {
		verifyCatalogIconsFile( baseDir, fileName );
	}

	verifyCatalogSearchIndex( baseDir );
}

function verifyCatalogVersion( baseDir ) {
	const versionPath = join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, FONT_AWESOME_7_VERSION_FILE );
	const versionData = readCatalogJson( versionPath, FONT_AWESOME_7_VERSION_FILE );
	const version = versionData.version;

	if ( typeof version !== 'string' || ! FONT_AWESOME_7_VERSION_PATTERN.test( version ) ) {
		throw new Error(
			`Font Awesome 7 catalog missing from plugin build: ${ join( FONT_AWESOME_7_RELATIVE_DIR, FONT_AWESOME_7_VERSION_FILE ) }`,
		);
	}
}

function verifyCatalogIconsFile( baseDir, fileName ) {
	const filePath = join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, 'json', fileName );
	const catalog = readCatalogJson( filePath, fileName );
	const icons = catalog.icons;

	if ( ! icons || typeof icons !== 'object' || Array.isArray( icons ) || 0 === Object.keys( icons ).length ) {
		throw new Error(
			`Font Awesome 7 catalog missing from plugin build: ${ join( FONT_AWESOME_7_RELATIVE_DIR, 'json', fileName ) }`,
		);
	}
}

function verifyCatalogSearchIndex( baseDir ) {
	const filePath = join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, 'json', FONT_AWESOME_7_SEARCH_INDEX_FILE );
	const { icons } = readCatalogJson( filePath, FONT_AWESOME_7_SEARCH_INDEX_FILE );

	if ( ! Array.isArray( icons ) || 0 === icons.length || ! icons.every( isSearchIndexEntry ) ) {
		throw new Error(
			`Font Awesome 7 catalog missing from plugin build: ${ catalogDisplayPath( FONT_AWESOME_7_SEARCH_INDEX_FILE ) }`,
		);
	}

	// Without metadata enrichment every entry falls back to names only, which silently degrades icon search.
	if ( ! icons.some( ( entry ) => Array.isArray( entry.terms ) && entry.terms.length > 0 ) ) {
		throw new Error(
			`Font Awesome 7 search index has no search terms: ${ catalogDisplayPath( FONT_AWESOME_7_SEARCH_INDEX_FILE ) }`,
		);
	}
}

function isSearchIndexEntry( entry ) {
	if ( ! entry || 'object' !== typeof entry ) {
		return false;
	}

	const { name, library, value } = entry;

	if ( 'string' !== typeof name || 'string' !== typeof library || 'string' !== typeof value ) {
		return false;
	}

	return value === `${ library } fa-${ name }`;
}

function readCatalogJson( filePath, relativeName ) {
	if ( ! existsSync( filePath ) ) {
		throw new Error(
			`Font Awesome 7 catalog missing from plugin build: ${ catalogDisplayPath( relativeName ) }`,
		);
	}

	try {
		return JSON.parse( readFileSync( filePath, 'utf8' ) );
	} catch {
		throw new Error(
			`Font Awesome 7 catalog missing from plugin build: ${ catalogDisplayPath( relativeName ) }`,
		);
	}
}

function catalogDisplayPath( relativeName ) {
	if ( relativeName === FONT_AWESOME_7_VERSION_FILE ) {
		return join( FONT_AWESOME_7_RELATIVE_DIR, FONT_AWESOME_7_VERSION_FILE );
	}

	return join( FONT_AWESOME_7_RELATIVE_DIR, 'json', relativeName );
}
