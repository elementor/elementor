import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT, resolveFromRoot } from './paths.mjs';

export const FONT_AWESOME_7_RELATIVE_DIR = 'assets/lib/font-awesome-7';

export const FONT_AWESOME_7_JSON_FILES = [ 'brands.json', 'regular.json', 'solid.json' ];

const EMPTY_CATALOG_FILE_BYTES = 0;

const GENERATE_SCRIPT = resolveFromRoot( 'packages/packages/tools/generate-font-awesome-7/src/generate.ts' );

export function generateFontAwesome7Catalog() {
	const result = spawnSync(
		process.execPath,
		[ '--experimental-strip-types', GENERATE_SCRIPT ],
		{
			cwd: ROOT,
			stdio: 'inherit',
		},
	);

	if ( result.status !== 0 ) {
		throw new Error( 'Failed to generate the Font Awesome 7 catalog.' );
	}
}

export function verifyFontAwesome7Catalog( baseDir ) {
	const jsonDir = join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, 'json' );

	for ( const fileName of FONT_AWESOME_7_JSON_FILES ) {
		const filePath = join( jsonDir, fileName );

		if ( ! existsSync( filePath ) || statSync( filePath ).size === EMPTY_CATALOG_FILE_BYTES ) {
			throw new Error(
				`Font Awesome 7 catalog missing from plugin build: ${ join( FONT_AWESOME_7_RELATIVE_DIR, 'json', fileName ) }`,
			);
		}
	}
}
