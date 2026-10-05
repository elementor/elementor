import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
	FONT_AWESOME_7_JSON_FILES,
	FONT_AWESOME_7_RELATIVE_DIR,
	verifyFontAwesome7Catalog,
} from '../font-awesome-7-catalog.mjs';

describe( 'verifyFontAwesome7Catalog', () => {
	it( 'throws when a catalog json file is missing', () => {
		// Arrange.
		const baseDir = mkdtempSync( join( tmpdir(), 'fa7-catalog-missing-' ) );
		const jsonDir = join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, 'json' );
		mkdirSync( jsonDir, { recursive: true } );

		for ( const fileName of FONT_AWESOME_7_JSON_FILES.slice( 1 ) ) {
			writeFileSync( join( jsonDir, fileName ), '{"icons":{}}' );
		}

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( FONT_AWESOME_7_JSON_FILES[ 0 ] ),
		);
	} );

	it( 'throws when a catalog json file is empty', () => {
		// Arrange.
		const baseDir = mkdtempSync( join( tmpdir(), 'fa7-catalog-empty-' ) );
		const jsonDir = join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, 'json' );
		mkdirSync( jsonDir, { recursive: true } );

		for ( const fileName of FONT_AWESOME_7_JSON_FILES ) {
			writeFileSync( join( jsonDir, fileName ), '' );
		}

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( 'Font Awesome 7 catalog missing from plugin build' ),
		);
	} );

	it( 'accepts a complete catalog', () => {
		// Arrange.
		const baseDir = mkdtempSync( join( tmpdir(), 'fa7-catalog-ok-' ) );
		const jsonDir = join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, 'json' );
		mkdirSync( jsonDir, { recursive: true } );

		for ( const fileName of FONT_AWESOME_7_JSON_FILES ) {
			writeFileSync( join( jsonDir, fileName ), '{"icons":{}}' );
		}

		// Act & Assert.
		assert.doesNotThrow( () => verifyFontAwesome7Catalog( baseDir ) );
	} );
} );
