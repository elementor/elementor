import { iconPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';

import { iconPropType } from '../../../__tests__/prop-types';
import { initSettingsTransformers } from '../../../init-settings-transformers';
import { createPropsResolver } from '../../../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../../../settings-transformers-registry';
import { resetFontAwesomeIconsCache } from '../icon-transformer';

const STAR_PATH = 'M0 0h100v100H0z';
const STAR_WIDTH = 576;
const STAR_HEIGHT = 512;

const mockFetch = ( body: unknown, ok = true ) => {
	global.fetch = jest.fn().mockResolvedValue( {
		ok,
		json: () => Promise.resolve( body ),
	} );
};

function createSavedIcon( iconClass: string, library: string ) {
	return iconPropTypeUtil.create( {
		value: stringPropTypeUtil.create( iconClass ),
		library: stringPropTypeUtil.create( library ),
	} );
}

async function resolveSavedIcon( iconClass: string, library: string ) {
	const resolve = createPropsResolver( {
		transformers: settingsTransformersRegistry,
		schema: { svg: iconPropType() },
	} );

	const result = await resolve( {
		props: {
			svg: createSavedIcon( iconClass, library ),
		},
	} );

	return result.svg;
}

describe( 'iconTransformer', () => {
	const originalElementorCommon = window.elementorCommon;

	beforeEach( () => {
		jest.clearAllMocks();
		resetFontAwesomeIconsCache();
		initSettingsTransformers();
		window.elementorCommon = {
			config: {
				urls: {
					assets: 'https://example.com/assets/',
				},
				'font-awesome': {
					v7: {
						jsonFiles: [ 'solid', 'regular', 'brands' ],
						jsonBaseUrl: 'https://example.com/assets/lib/font-awesome-7/json/',
					},
				},
			},
		};
	} );

	afterEach( () => {
		window.elementorCommon = originalElementorCommon;
		jest.restoreAllMocks();
	} );

	it( 'returns processed inline svg for a font awesome icon', async () => {
		// Arrange.
		mockFetch( {
			icons: {
				star: [ STAR_WIDTH, STAR_HEIGHT, [], 'f005', STAR_PATH ],
			},
		} );

		// Act.
		const result = await resolveSavedIcon( 'fas fa-star', 'fa-solid' );

		// Assert.
		expect( global.fetch ).toHaveBeenCalledWith( 'https://example.com/assets/lib/font-awesome-7/json/solid.json', {
			signal: undefined,
		} );
		expect( result ).toEqual( {
			html: expect.stringContaining( STAR_PATH ),
			url: null,
		} );
		expect( ( result as { html: string } ).html ).toContain( 'fill="currentColor"' );
		expect( ( result as { html: string } ).html ).toContain( `viewBox="0 0 ${ STAR_WIDTH } ${ STAR_HEIGHT }"` );
		expect( ( result as { html: string } ).html ).toContain( 'aria-hidden="true"' );
		expect( ( result as { html: string } ).html ).toContain( 'overflow: visible' );
	} );

	it( 'resolves icons by alias name', async () => {
		// Arrange.
		mockFetch( {
			icons: {
				headphones: [ 448, 512, [ 'headphones-simple' ], 'f025', 'M0 0' ],
			},
		} );

		// Act.
		const result = await resolveSavedIcon( 'fas fa-headphones-simple', 'fa-solid' );

		// Assert.
		expect( result ).toEqual( {
			html: expect.stringContaining( 'M0 0' ),
			url: null,
		} );
	} );

	it( 'renders multiple paths when the icon definition contains an array', async () => {
		// Arrange.
		mockFetch( {
			icons: {
				slash: [ 640, 640, [], 'f715', [ 'M0 0', 'M10 10' ] ],
			},
		} );

		// Act.
		const result = await resolveSavedIcon( 'fas fa-slash', 'fa-solid' );

		// Assert.
		const html = ( result as { html: string } ).html;
		expect( html.match( /<path/g ) ).toHaveLength( 2 );
		expect( html ).toContain( 'M0 0' );
		expect( html ).toContain( 'M10 10' );
	} );

	it( 'returns null html when the icon cannot be resolved', async () => {
		// Arrange.
		mockFetch( { icons: {} } );

		// Act.
		const result = await resolveSavedIcon( 'fas fa-missing', 'fa-solid' );

		// Assert.
		expect( result ).toEqual( { html: null, url: null } );
	} );

	it( 'fetches json from the localized font awesome 7 base url', async () => {
		// Arrange.
		const jsonBaseUrl = 'https://cdn.example.com/fa7/json/';
		window.elementorCommon = {
			config: {
				'font-awesome': {
					v7: {
						jsonFiles: [ 'solid', 'regular', 'brands' ],
						jsonBaseUrl,
					},
				},
			},
		};
		mockFetch( {
			icons: {
				star: [ STAR_WIDTH, STAR_HEIGHT, [], 'f005', STAR_PATH ],
			},
		} );

		// Act.
		await resolveSavedIcon( 'fas fa-star', 'fa-solid' );

		// Assert.
		expect( global.fetch ).toHaveBeenCalledWith( `${ jsonBaseUrl }solid.json`, {
			signal: undefined,
		} );
	} );

	it( 'does not fetch json when library is not an allowed fa7 file', async () => {
		// Arrange.
		mockFetch( { icons: {} } );

		// Act.
		const result = await resolveSavedIcon( 'fas fa-star', 'fa-../../wp-config' );

		// Assert.
		expect( global.fetch ).not.toHaveBeenCalled();
		expect( result ).toEqual( { html: null, url: null } );
	} );

	it( 'returns null html when value or library is missing', async () => {
		// Act.
		const resolve = createPropsResolver( {
			transformers: settingsTransformersRegistry,
			schema: { svg: iconPropType() },
		} );
		const result = await resolve( {
			props: {
				svg: iconPropTypeUtil.create( {
					value: stringPropTypeUtil.create( 'fas fa-star' ),
					library: stringPropTypeUtil.create( '' ),
				} ),
			},
		} );

		// Assert.
		expect( result.svg ).toEqual( { html: null, url: null } );
	} );
} );
