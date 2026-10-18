import {
	registerIconLibraryProvider,
	resetFontAwesome7IconsCache,
	unregisterIconLibraryProvider,
} from '@elementor/editor-controls';
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

	it( 'asks providers for a font awesome icon missing from the free data', async () => {
		// Arrange.
		mockFetch( { icons: {} } );
		const resolveSvg = jest
			.fn()
			.mockResolvedValue(
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M2 2h6v6H2z"></path></svg>'
			);
		registerIconLibraryProvider( {
			id: 'test-provider',
			useIcons: () => ( { data: [], isLoading: false } ),
			resolveSvg,
		} );

		// Act.
		const result = ( await resolveSavedIcon( 'fal fa-star', 'fa-light' ) ) as { html: string; url: string | null };

		unregisterIconLibraryProvider( 'test-provider' );

		// Assert.
		expect( resolveSvg ).toHaveBeenCalledWith( 'fa-light', 'fal fa-star', undefined );
		expect( result.html ).toContain( 'M2 2h6v6H2z' );
		expect( result.url ).toBeNull();
	} );

	it( 'returns null html for a font awesome icon when no provider resolves it', async () => {
		// Arrange.
		mockFetch( { icons: {} } );
		registerIconLibraryProvider( {
			id: 'test-provider',
			useIcons: () => ( { data: [], isLoading: false } ),
			resolveSvg: async () => null,
		} );

		// Act.
		const result = await resolveSavedIcon( 'fal fa-star', 'fa-light' );

		unregisterIconLibraryProvider( 'test-provider' );

		// Assert.
		expect( result ).toEqual( { html: null, url: null } );
	} );

	it( 'falls back to the default svg when no provider resolves a non-native library', async () => {
		// Arrange.
		registerIconLibraryProvider( {
			id: 'test-provider',
			useIcons: () => ( { data: [], isLoading: false } ),
		} );
		const defaultSvg =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M24.9999 4.31543"></path></svg>';
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			headers: new Headers( { 'content-type': 'image/svg+xml' } ),
			text: () => Promise.resolve( defaultSvg ),
		} );

		// Act.
		const result = await resolveSavedIcon( 'missing-set missing-set-ghost', 'missing-set' );

		unregisterIconLibraryProvider( 'test-provider' );

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

	it( 'falls back to the default svg for a non-native library when no provider is registered', async () => {
		// Arrange.
		const defaultSvg =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M24.9999 4.31543"></path></svg>';
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			headers: new Headers( { 'content-type': 'image/svg+xml' } ),
			text: () => Promise.resolve( defaultSvg ),
		} );

		// Act.
		const result = await resolveSavedIcon( 'my-set my-set-star', 'my-set' );

		// Assert.
		expect( result ).toEqual( {
			html: expect.stringContaining( 'M24.9999 4.31543' ),
			url: 'https://example.com/assets/images/default-svg.svg',
		} );
	} );

	it( 'does not replace PHP-managed eicons with the default svg', async () => {
		// Arrange.
		global.fetch = jest.fn();

		// Act.
		const result = await resolveSavedIcon( 'eicon-edit', 'eicons' );

		// Assert.
		expect( result ).toEqual( { html: null, url: null } );
		expect( global.fetch ).not.toHaveBeenCalled();
	} );

	it( 'renders and sanitizes svg returned by a provider', async () => {
		// Arrange.
		registerIconLibraryProvider( {
			id: 'test-provider',
			useIcons: () => ( { data: [], isLoading: false } ),
			resolveSvg: () =>
				Promise.resolve(
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script><path d="M1 1h8v8H1z"></path></svg>'
				),
		} );

		// Act.
		const result = ( await resolveSavedIcon( 'my-set my-set-star', 'my-set' ) ) as { html: string };

		unregisterIconLibraryProvider( 'test-provider' );

		// Assert.
		expect( result.html ).toContain( 'M1 1h8v8H1z' );
		expect( result.html ).not.toContain( 'script' );
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
