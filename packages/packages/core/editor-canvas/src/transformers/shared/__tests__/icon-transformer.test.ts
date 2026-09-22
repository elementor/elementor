import { resetCustomIconLibrariesCache, resetFontAwesome7IconsCache } from '@elementor/editor-controls';
import { iconPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';

import { iconPropType } from '../../../__tests__/prop-types';
import { initSettingsTransformers } from '../../../init-settings-transformers';
import { createPropsResolver } from '../../../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../../../settings-transformers-registry';

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
	const originalElementor = window.elementor;

	beforeEach( () => {
		jest.clearAllMocks();
		resetFontAwesome7IconsCache();
		resetCustomIconLibrariesCache();
		initSettingsTransformers();
		window.elementorCommon = {
			config: {
				urls: {
					assets: 'https://example.com/assets/',
				},
				fontAwesome: {
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
		window.elementor = originalElementor;
		resetCustomIconLibrariesCache();
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
				fontAwesome: {
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

	it( 'returns processed inline svg for a custom library icon with markup', async () => {
		// Arrange.
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{
							name: 'my-icons',
							label: 'My Icons',
							prefix: 'my-icons-',
							displayPrefix: 'my-icons',
							fetchJson: 'https://example.com/uploads/my-icons.js',
							native: false,
						},
					],
				},
			},
			helpers: {
				enqueueIconFonts: jest.fn(),
			},
		} as typeof window.elementor;
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			json: () =>
				Promise.resolve( {
					icons: {
						badge: {
							svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="${ STAR_PATH }"></path></svg>`,
						},
					},
				} ),
		} );

		// Act.
		const result = await resolveSavedIcon( 'my-icons my-icons-badge', 'my-icons' );

		// Assert.
		expect( result ).toEqual( {
			html: expect.stringContaining( STAR_PATH ),
			url: null,
		} );
	} );

	it( 'falls back to the default svg when a custom library has been deleted', async () => {
		// Arrange.
		window.elementor = {
			config: {
				icons: {
					libraries: [ { name: 'fa-solid', prefix: 'fa-', native: true } ],
				},
			},
		} as typeof window.elementor;
		const defaultSvg =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M24.9999 4.31543"></path></svg>';
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			headers: new Headers( { 'content-type': 'image/svg+xml' } ),
			text: () => Promise.resolve( defaultSvg ),
		} );

		// Act.
		const result = await resolveSavedIcon( 'missing-set missing-set-ghost', 'missing-set' );

		// Assert.
		expect( global.fetch ).toHaveBeenCalledWith(
			'https://example.com/assets/images/default-svg.svg',
			expect.anything()
		);
		expect( result ).toEqual( {
			html: expect.stringContaining( 'M24.9999 4.31543' ),
			url: 'https://example.com/assets/images/default-svg.svg',
		} );
	} );

	it( 'renders a webfont glyph when a custom library has no svg files', async () => {
		// Arrange.
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{
							name: 'my-icons',
							label: 'My Icons',
							prefix: 'my-icons-',
							displayPrefix: 'my-icons',
							fetchJson: 'https://example.com/uploads/my-icons.js',
							url: 'https://example.com/uploads/my-icons.css',
							native: false,
						},
					],
				},
			},
			helpers: {
				enqueueIconFonts: jest.fn(),
			},
		} as typeof window.elementor;
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			json: () => Promise.resolve( { icons: {} } ),
		} );

		// Act.
		const result = await resolveSavedIcon( 'my-icons my-icons-badge', 'my-icons' );

		// Assert.
		expect( result ).toEqual( {
			html: expect.stringContaining( 'my-icons my-icons-badge' ),
			url: null,
		} );
		expect( ( result as { html: string } ).html ).toContain( '<i class="my-icons my-icons-badge"' );
		expect( document.head.querySelector( 'link[href="https://example.com/uploads/my-icons.css"]' ) ).not.toBeNull();
		expect( global.fetch ).not.toHaveBeenCalledWith(
			'https://example.com/assets/images/default-svg.svg',
			expect.anything()
		);
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
