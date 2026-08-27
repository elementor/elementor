import { iconTransformer, resetFontAwesomeIconsCache } from '../icon-transformer';

const FA7_STAR_PATH = 'M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z';
const STAR_WIDTH = 576;
const STAR_HEIGHT = 512;

const mockFetch = ( body: unknown, ok = true ) => {
	global.fetch = jest.fn().mockResolvedValue( {
		ok,
		json: () => Promise.resolve( body ),
	} );
};

describe( 'iconTransformer', () => {
	const originalElementorCommon = window.elementorCommon;

	beforeEach( () => {
		jest.clearAllMocks();
		resetFontAwesomeIconsCache();
		window.elementorCommon = {
			config: {
				urls: {
					assets: 'https://example.com/assets/',
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
				star: [ STAR_WIDTH, STAR_HEIGHT, [], 'f005', FA7_STAR_PATH ],
			},
		} );

		// Act.
		const result = await iconTransformer( { value: 'fas fa-star', library: 'fa-solid' }, { key: 'svg' } );

		// Assert.
		expect( global.fetch ).toHaveBeenCalledWith(
			'https://example.com/assets/lib/font-awesome-7/json/solid.json',
			{ signal: undefined }
		);
		expect( result ).toEqual( {
			html: expect.stringContaining( FA7_STAR_PATH ),
			url: null,
		} );
		expect( ( result as { html: string } ).html ).toContain( 'fill="currentColor"' );
		expect( ( result as { html: string } ).html ).toContain( 'viewBox="0 0 576 512"' );
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
		const result = await iconTransformer(
			{ value: 'fas fa-headphones-simple', library: 'fa-solid' },
			{ key: 'svg' }
		);

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
		const result = await iconTransformer( { value: 'fas fa-slash', library: 'fa-solid' }, { key: 'svg' } );

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
		const result = await iconTransformer( { value: 'fas fa-missing', library: 'fa-solid' }, { key: 'svg' } );

		// Assert.
		expect( result ).toEqual( { html: null, url: null } );
	} );

	it( 'returns null html when value or library is missing', async () => {
		// Act.
		const result = await iconTransformer( { value: 'fas fa-star' }, { key: 'svg' } );

		// Assert.
		expect( result ).toEqual( { html: null, url: null } );
	} );
} );
