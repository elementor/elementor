#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { globSync } from 'glob';
import { minimatch } from 'minimatch';

import { BUILD_DIR, ROOT } from './shared/paths.mjs';
import { PLUGIN_FILE_PATTERNS } from './shared/plugin-files.mjs';

const FONT_AWESOME_7_JSON_DIR = join( ROOT, 'assets/lib/font-awesome-7/json' );
const FONT_AWESOME_7_JSON_FILES = [ 'solid.json', 'regular.json', 'brands.json' ];
const FONT_AWESOME_7_GENERATE_SCRIPT = join(
	ROOT,
	'packages/packages/tools/generate-font-awesome-7/src/generate.ts'
);

/**
 * Directories that are excluded with no later re-inclusion, pruned up front so the scan does not
 * walk them at all. `vendor` and `core/**\/assets` are deliberately absent: both are excluded
 * broadly and then partially re-included.
 */
const PRUNED = [
	'**/node_modules/**',
	'.git/**',
	'.github/**',
	'.cursor/**',
	'.vscode/**',
	'.run/**',
	'app/**/assets/**',
	'assets/dev/**',
	'bin/**',
	'build/**',
	'docs/**',
	'examples/**',
	'hello-elementor/**',
	'local-site/**',
	'modules/**/assets/**',
	'packages/**',
	'php-scoper/**',
	'test-results/**',
	'tests/**',
	'tmp/**',
];

/**
 * Applies the patterns in order, as `PLUGIN_FILE_PATTERNS` requires: a positive pattern adds matches
 * to the set and a negative pattern removes them, so the last pattern to match a path decides.
 */
function selectPluginFiles( candidates ) {
	const selected = new Set();

	for ( const pattern of PLUGIN_FILE_PATTERNS ) {
		const isNegated = pattern.startsWith( '!' );
		const matcher = isNegated ? pattern.slice( 1 ) : pattern;

		for ( const candidate of candidates ) {
			if ( ! minimatch( candidate, matcher ) ) {
				continue;
			}

			if ( isNegated ) {
				selected.delete( candidate );
			} else {
				selected.add( candidate );
			}
		}
	}

	return [ ...selected ];
}

function hasFontAwesome7Catalog() {
	return FONT_AWESOME_7_JSON_FILES.every( ( fileName ) => existsSync( join( FONT_AWESOME_7_JSON_DIR, fileName ) ) );
}

function generateFontAwesome7Catalog() {
	const result = spawnSync( process.execPath, [ '--experimental-strip-types', FONT_AWESOME_7_GENERATE_SCRIPT ], {
		cwd: ROOT,
		stdio: 'inherit',
	} );

	if ( result.error || result.status !== 0 ) {
		throw new Error( 'Failed to generate Font Awesome 7 catalog' );
	}
}

function ensureFontAwesome7Catalog() {
	if ( hasFontAwesome7Catalog() ) {
		return;
	}

	generateFontAwesome7Catalog();

	if ( ! hasFontAwesome7Catalog() ) {
		throw new Error( 'Font Awesome 7 catalog was not written to assets/lib/font-awesome-7/json' );
	}
}

export function assemblePlugin() {
	const startedAt = Date.now();

	ensureFontAwesome7Catalog();

	rmSync( BUILD_DIR, { recursive: true, force: true } );

	const candidates = globSync( '**', {
		cwd: ROOT,
		nodir: true,
		dot: false,
		ignore: PRUNED,
		posix: true,
	} );

	const files = selectPluginFiles( candidates );

	for ( const file of files.sort() ) {
		const destination = join( BUILD_DIR, file );

		mkdirSync( dirname( destination ), { recursive: true } );
		cpSync( join( ROOT, file ), destination );
	}

	console.log( `[vite:plugin] Assembled ${ files.length } files into build/ in ${ Date.now() - startedAt }ms` );
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	assemblePlugin();
}
