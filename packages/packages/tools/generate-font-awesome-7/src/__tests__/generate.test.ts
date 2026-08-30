import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import {
	assertFontAwesome7Packages,
	buildIconsJsonFromPack,
	generateFontAwesome7,
	serializeIconsJson,
} from '../generate.mjs';

describe( 'generateFontAwesome7', () => {
	it( 'throws when an installed package is not major 7', () => {
		// Arrange.
		const readVersion = () => '6.7.2';

		// Act.
		const act = () => assertFontAwesome7Packages( readVersion );

		// Assert.
		expect( act ).toThrow( 'Expected @fortawesome/free-solid-svg-icons major 7, found 6.7.2.' );
	} );

	it( 'writes the FA5-shaped envelope and preserves aliases and multi-path data', () => {
		// Arrange.
		const iconPackModule = {
			faStar: {
				iconName: 'star',
				icon: [ 512, 512, [ 'favorite' ], 'f005', 'M0 0' ],
			},
			faSlash: {
				iconName: 'slash',
				icon: [ 640, 640, [], 'f715', [ 'M0 0', 'M10 10' ] ],
			},
			notAnIcon: 'ignored',
		};

		// Act.
		const iconsJson = buildIconsJsonFromPack( iconPackModule );

		// Assert.
		expect( iconsJson ).toEqual( {
			icons: {
				star: [ 512, 512, [ 'favorite' ], 'f005', 'M0 0' ],
				slash: [ 640, 640, [], 'f715', [ 'M0 0', 'M10 10' ] ],
			},
		} );
		expect( serializeIconsJson( iconsJson ) ).toContain( '"star"' );
	} );

	it( 'writes only json and license files', () => {
		// Arrange.
		const targetDir = join( process.cwd(), `tmp-font-awesome-7-test-${ Date.now() }` );

		// Act.
		const result = generateFontAwesome7( { targetDir } );

		// Assert.
		expect( existsSync( join( targetDir, 'json/solid.json' ) ) ).toBe( true );
		expect( existsSync( join( targetDir, 'json/regular.json' ) ) ).toBe( true );
		expect( existsSync( join( targetDir, 'json/brands.json' ) ) ).toBe( true );
		expect( existsSync( join( targetDir, 'LICENSE.txt' ) ) ).toBe( true );
		expect( JSON.parse( readFileSync( join( targetDir, 'version.json' ), 'utf8' ) ).version ).toMatch( /^7\./ );
		expect( result.version ).toMatch( /^7\./ );

		rmSync( targetDir, { recursive: true, force: true } );
	} );
} );
