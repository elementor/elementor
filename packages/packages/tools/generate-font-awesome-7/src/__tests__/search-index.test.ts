import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
	buildSearchIndex,
	createIconSelectionValue,
	LICENSE_FREE,
	LICENSE_PRO,
	readCategories,
	readIconMetadata,
	serializeSearchIndex,
} from '../search-index';

const iconTuple = ( aliases: unknown[] = [] ): [ number, number, unknown[], string, string ] => [
	512,
	512,
	aliases,
	'f07a',
	'M0 0',
];

const solidPack = ( names: string[], aliases: unknown[] = [] ) => ( {
	icons: Object.fromEntries( names.map( ( name ) => [ name, iconTuple( aliases ) ] ) ),
} );

const freeSolid = { free: [ { family: 'classic', style: 'solid' } ] };

describe( 'buildSearchIndex', () => {
	it( 'builds the canonical selection value so MCP writes match a manual pick', () => {
		// Arrange.
		const iconsByFileName = { solid: solidPack( [ 'cart-shopping' ] ) };

		// Act.
		const { icons } = buildSearchIndex( {
			iconsByFileName,
			metadata: {},
			categoriesByIconName: {},
		} );

		// Assert.
		expect( icons[ 0 ].value ).toBe( 'fa-solid fa-cart-shopping' );
		expect( icons[ 0 ].value ).toBe( createIconSelectionValue( 'fa-solid', 'cart-shopping' ) );
	} );

	it( 'enriches with label, aliases, terms and categories from metadata', () => {
		// Arrange.
		const iconsByFileName = { solid: solidPack( [ 'cart-shopping' ] ) };
		const metadata = {
			'cart-shopping': {
				label: 'Cart Shopping',
				aliases: { names: [ 'shopping-cart' ] },
				search: { terms: [ 'add to cart', 'checkout' ] },
				familyStylesByLicense: freeSolid,
			},
		};

		// Act.
		const { icons } = buildSearchIndex( {
			iconsByFileName,
			metadata,
			categoriesByIconName: { 'cart-shopping': [ 'Shopping' ] },
		} );

		// Assert.
		expect( icons[ 0 ] ).toEqual( {
			name: 'cart-shopping',
			library: 'fa-solid',
			value: 'fa-solid fa-cart-shopping',
			label: 'Cart Shopping',
			aliases: [ 'shopping-cart' ],
			terms: [ 'add to cart', 'checkout' ],
			categories: [ 'Shopping' ],
			license: LICENSE_FREE,
		} );
	} );

	it( 'never emits an icon that is absent from the shipped packs', () => {
		// Arrange.
		const iconsByFileName = { solid: solidPack( [ 'star' ] ) };
		const metadata = {
			star: { label: 'Star', familyStylesByLicense: freeSolid },
			'pro-only-icon': { label: 'Pro Only', familyStylesByLicense: freeSolid },
		};

		// Act.
		const { icons } = buildSearchIndex( { iconsByFileName, metadata, categoriesByIconName: {} } );

		// Assert.
		expect( icons.map( ( icon ) => icon.name ) ).toEqual( [ 'star' ] );
	} );

	it( 'emits one entry per style for a name that ships in several libraries', () => {
		// Arrange.
		const iconsByFileName = {
			solid: solidPack( [ 'address-book' ] ),
			regular: solidPack( [ 'address-book' ] ),
		};

		// Act.
		const { icons } = buildSearchIndex( { iconsByFileName, metadata: {}, categoriesByIconName: {} } );

		// Assert.
		expect( icons.map( ( icon ) => icon.value ) ).toEqual( [
			'fa-regular fa-address-book',
			'fa-solid fa-address-book',
		] );
	} );

	it( 'drops unicode codepoint aliases and keeps string aliases', () => {
		// Arrange.
		const iconsByFileName = { solid: solidPack( [ 'house' ], [ 127968, 'home', '' ] ) };

		// Act.
		const { icons } = buildSearchIndex( { iconsByFileName, metadata: {}, categoriesByIconName: {} } );

		// Assert.
		expect( icons[ 0 ].aliases ).toEqual( [ 'home' ] );
	} );

	it( 'falls back to a readable label when metadata has no entry', () => {
		// Arrange.
		const iconsByFileName = { solid: solidPack( [ 'cart-shopping' ] ) };

		// Act.
		const { icons } = buildSearchIndex( { iconsByFileName, metadata: {}, categoriesByIconName: {} } );

		// Assert.
		expect( icons[ 0 ].label ).toBe( 'cart shopping' );
		expect( icons[ 0 ].license ).toBe( LICENSE_FREE );
	} );

	it( 'marks a style that metadata does not list as free', () => {
		// Arrange.
		const iconsByFileName = { solid: solidPack( [ 'crown' ] ) };
		const metadata = {
			crown: { familyStylesByLicense: { free: [ { family: 'classic', style: 'regular' } ] } },
		};

		// Act.
		const { icons } = buildSearchIndex( { iconsByFileName, metadata, categoriesByIconName: {} } );

		// Assert.
		expect( icons[ 0 ].license ).toBe( LICENSE_PRO );
	} );

	it( 'ignores unknown pack file names', () => {
		// Arrange.
		const iconsByFileName = { duotone: solidPack( [ 'star' ] ) };

		// Act.
		const { icons } = buildSearchIndex( { iconsByFileName, metadata: {}, categoriesByIconName: {} } );

		// Assert.
		expect( icons ).toEqual( [] );
	} );

	it( 'serializes deterministically so rebuilds produce identical bytes', () => {
		// Arrange.
		const iconsByFileName = { solid: solidPack( [ 'star', 'anchor' ] ) };
		const args = { iconsByFileName, metadata: {}, categoriesByIconName: {} };

		// Act.
		const first = serializeSearchIndex( buildSearchIndex( args ) );
		const second = serializeSearchIndex( buildSearchIndex( args ) );

		// Assert.
		expect( first ).toBe( second );
		expect( JSON.parse( first ).icons.map( ( icon: { name: string } ) => icon.name ) ).toEqual( [
			'anchor',
			'star',
		] );
	} );
} );

describe( 'readIconMetadata / readCategories', () => {
	let metadataDir: string;

	beforeEach( () => {
		metadataDir = mkdtempSync( join( tmpdir(), 'fa7-metadata-' ) );
	} );

	afterEach( () => {
		rmSync( metadataDir, { recursive: true, force: true } );
	} );

	it( 'maps every icon in a category to that category label', () => {
		// Arrange.
		const categoriesPath = join( metadataDir, 'categories.yml' );
		writeFileSync(
			categoriesPath,
			[
				'shopping:',
				'  label: Shopping',
				'  icons:',
				'    - cart-shopping',
				'    - basket-shopping',
				'transportation:',
				'  label: Transportation',
				'  icons:',
				'    - cart-shopping',
			].join( '\n' )
		);

		// Act.
		const categoriesByIconName = readCategories( categoriesPath );

		// Assert.
		expect( categoriesByIconName[ 'cart-shopping' ] ).toEqual( [ 'Shopping', 'Transportation' ] );
		expect( categoriesByIconName[ 'basket-shopping' ] ).toEqual( [ 'Shopping' ] );
	} );

	it( 'falls back to the category key when it has no label', () => {
		// Arrange.
		const categoriesPath = join( metadataDir, 'categories.yml' );
		writeFileSync( categoriesPath, [ 'alert:', '  icons:', '    - bell' ].join( '\n' ) );

		// Act.
		const categoriesByIconName = readCategories( categoriesPath );

		// Assert.
		expect( categoriesByIconName.bell ).toEqual( [ 'alert' ] );
	} );

	it( 'returns an empty map for metadata that is not an object', () => {
		// Arrange.
		const metadataPath = join( metadataDir, 'icon-families.json' );
		writeFileSync( metadataPath, '[]' );

		// Act.
		const metadata = readIconMetadata( metadataPath );

		// Assert.
		expect( metadata ).toEqual( {} );
	} );
} );
