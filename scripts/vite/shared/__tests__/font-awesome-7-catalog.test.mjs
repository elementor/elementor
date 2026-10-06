import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
	FONT_AWESOME_7_GENERATE_ARGS,
	FONT_AWESOME_7_JSON_FILES,
	FONT_AWESOME_7_RELATIVE_DIR,
	FONT_AWESOME_7_SEARCH_INDEX_FILE,
	FONT_AWESOME_7_VERSION_FILE,
	ensureFontAwesome7Catalog,
	generateFontAwesome7Catalog,
	verifyFontAwesome7Catalog,
} from '../font-awesome-7-catalog.mjs';

const VALID_ICONS_JSON = JSON.stringify( { icons: { star: [ 512, 512, [], 'f000', 'M0 0' ] } } );
const VALID_VERSION_JSON = JSON.stringify( { version: '7.3.1' } );
const EMPTY_ICONS_JSON = JSON.stringify( { icons: {} } );
const VALID_SEARCH_INDEX_JSON = JSON.stringify( {
	icons: [
		{
			name: 'star',
			library: 'fa-solid',
			value: 'fa-solid fa-star',
			label: 'Star',
			aliases: [],
			terms: [ 'favorite' ],
			categories: [ 'Shapes' ],
			license: 'free',
		},
	],
} );

describe( 'verifyFontAwesome7Catalog', () => {
	it( 'throws when a catalog json file is missing', () => {
		// Arrange.
		const baseDir = writeCatalog( {
			iconsJsonByFile: Object.fromEntries(
				FONT_AWESOME_7_JSON_FILES.slice( 1 ).map( ( fileName ) => [ fileName, VALID_ICONS_JSON ] ),
			),
		} );

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( FONT_AWESOME_7_JSON_FILES[ 0 ] ),
		);
	} );

	it( 'throws when a catalog json file is empty', () => {
		// Arrange.
		const baseDir = writeCatalog( {
			iconsJsonByFile: Object.fromEntries(
				FONT_AWESOME_7_JSON_FILES.map( ( fileName ) => [ fileName, '' ] ),
			),
		} );

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( 'Font Awesome 7 catalog missing from plugin build' ),
		);
	} );

	it( 'throws when icons is an empty object', () => {
		// Arrange.
		const baseDir = writeCatalog( {
			iconsJsonByFile: Object.fromEntries(
				FONT_AWESOME_7_JSON_FILES.map( ( fileName ) => [ fileName, EMPTY_ICONS_JSON ] ),
			),
		} );

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( 'Font Awesome 7 catalog missing from plugin build' ),
		);
	} );

	it( 'throws when version.json is missing or not major 7', () => {
		// Arrange.
		const baseDir = writeCatalog( { versionJson: JSON.stringify( { version: '6.7.2' } ) } );

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( FONT_AWESOME_7_VERSION_FILE ),
		);
	} );

	it( 'throws when the search index is missing', () => {
		// Arrange.
		const baseDir = writeCatalog( { searchIndexJson: null } );

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( FONT_AWESOME_7_SEARCH_INDEX_FILE ),
		);
	} );

	it( 'throws when the search index has no icons', () => {
		// Arrange.
		const baseDir = writeCatalog( { searchIndexJson: JSON.stringify( { icons: [] } ) } );

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( FONT_AWESOME_7_SEARCH_INDEX_FILE ),
		);
	} );

	it( 'throws when a search index value is not the canonical selection value', () => {
		// Arrange.
		const baseDir = writeCatalog( {
			searchIndexJson: JSON.stringify( {
				icons: [ { name: 'star', library: 'fa-solid', value: 'fas fa-star', terms: [ 'favorite' ] } ],
			} ),
		} );

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( FONT_AWESOME_7_SEARCH_INDEX_FILE ),
		);
	} );

	it( 'throws when metadata enrichment produced no search terms', () => {
		// Arrange.
		const baseDir = writeCatalog( {
			searchIndexJson: JSON.stringify( {
				icons: [ { name: 'star', library: 'fa-solid', value: 'fa-solid fa-star', terms: [] } ],
			} ),
		} );

		// Act & Assert.
		assert.throws(
			() => verifyFontAwesome7Catalog( baseDir ),
			( error ) => error.message.includes( 'no search terms' ),
		);
	} );

	it( 'accepts a complete catalog', () => {
		// Arrange.
		const baseDir = writeCatalog();

		// Act & Assert.
		assert.doesNotThrow( () => verifyFontAwesome7Catalog( baseDir ) );
	} );
} );

describe( 'generateFontAwesome7Catalog', () => {
	it( 'spawns node with strip-types and the generator script', () => {
		// Arrange.
		const calls = [];
		const spawn = ( command, args, options ) => {
			calls.push( { command, args, options } );
			return { status: 0 };
		};

		// Act.
		generateFontAwesome7Catalog( { spawn } );

		// Assert.
		assert.equal( calls.length, 1 );
		assert.equal( calls[ 0 ].command, process.execPath );
		assert.deepEqual( calls[ 0 ].args, FONT_AWESOME_7_GENERATE_ARGS );
		assert.equal( calls[ 0 ].options.stdio, 'inherit' );
	} );

	it( 'throws when the generator exits non-zero', () => {
		// Arrange.
		const spawn = () => ( { status: 1 } );

		// Act & Assert.
		assert.throws(
			() => generateFontAwesome7Catalog( { spawn } ),
			( error ) => error.message.includes( 'exited with 1' ),
		);
	} );

	it( 'throws when spawn fails to start', () => {
		// Arrange.
		const spawn = () => ( { error: new Error( 'ENOENT' ), status: null } );

		// Act & Assert.
		assert.throws(
			() => generateFontAwesome7Catalog( { spawn } ),
			( error ) => error.message.includes( 'ENOENT' ),
		);
	} );

	it( 'throws when the generator is killed by a signal', () => {
		// Arrange.
		const spawn = () => ( { signal: 'SIGTERM', status: null } );

		// Act & Assert.
		assert.throws(
			() => generateFontAwesome7Catalog( { spawn } ),
			( error ) => error.message.includes( 'killed by SIGTERM' ),
		);
	} );
} );

describe( 'ensureFontAwesome7Catalog', () => {
	it( 'does not spawn when the catalog is already valid', () => {
		// Arrange.
		const catalogRoot = writeCatalog();
		const calls = [];
		const spawn = ( ...args ) => {
			calls.push( args );
			return { status: 0 };
		};

		// Act.
		ensureFontAwesome7Catalog( { spawn, catalogRoot } );

		// Assert.
		assert.equal( calls.length, 0 );
	} );

	it( 'spawns the generator when the catalog is missing', () => {
		// Arrange.
		const catalogRoot = mkdtempSync( join( tmpdir(), 'fa7-catalog-missing-root-' ) );
		const calls = [];
		const spawn = ( command, args ) => {
			calls.push( { command, args } );
			return { status: 0 };
		};

		// Act.
		ensureFontAwesome7Catalog( { spawn, catalogRoot } );

		// Assert.
		assert.equal( calls.length, 1 );
		assert.equal( calls[ 0 ].command, process.execPath );
		assert.deepEqual( calls[ 0 ].args, FONT_AWESOME_7_GENERATE_ARGS );
	} );

	it( 'spawns the generator when icons is an empty object', () => {
		// Arrange.
		const catalogRoot = writeCatalog( {
			iconsJsonByFile: Object.fromEntries(
				FONT_AWESOME_7_JSON_FILES.map( ( fileName ) => [ fileName, EMPTY_ICONS_JSON ] ),
			),
		} );
		const calls = [];
		const spawn = () => {
			calls.push( true );
			return { status: 0 };
		};

		// Act.
		ensureFontAwesome7Catalog( { spawn, catalogRoot } );

		// Assert.
		assert.equal( calls.length, 1 );
	} );
} );

function writeCatalog( {
	iconsJsonByFile = Object.fromEntries(
		FONT_AWESOME_7_JSON_FILES.map( ( fileName ) => [ fileName, VALID_ICONS_JSON ] ),
	),
	versionJson = VALID_VERSION_JSON,
	searchIndexJson = VALID_SEARCH_INDEX_JSON,
} = {} ) {
	const baseDir = mkdtempSync( join( tmpdir(), 'fa7-catalog-' ) );
	const jsonDir = join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, 'json' );
	mkdirSync( jsonDir, { recursive: true } );
	writeFileSync( join( baseDir, FONT_AWESOME_7_RELATIVE_DIR, FONT_AWESOME_7_VERSION_FILE ), versionJson );

	for ( const [ fileName, contents ] of Object.entries( iconsJsonByFile ) ) {
		writeFileSync( join( jsonDir, fileName ), contents );
	}

	if ( null !== searchIndexJson ) {
		writeFileSync( join( jsonDir, FONT_AWESOME_7_SEARCH_INDEX_FILE ), searchIndexJson );
	}

	return baseDir;
}
