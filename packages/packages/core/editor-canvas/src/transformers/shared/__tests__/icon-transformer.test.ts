import { iconTransformer, resetFontAwesomeIconsCache } from '../icon-transformer';

const STAR_PATH = 'M0 0h100v100H0z';
const STAR_WIDTH = 512;
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
				star: [ STAR_WIDTH, STAR_HEIGHT, [], 'f005', STAR_PATH ],
			},
		} );

		// Act.
		const result = await iconTransformer( { value: 'fas fa-star', library: 'fa-solid' }, { key: 'svg' } );

		// Assert.
		expect( global.fetch ).toHaveBeenCalledWith( 'https://example.com/assets/lib/font-awesome/json/solid.json', {
			signal: undefined,
		} );
		expect( result ).toEqual( {
			html: expect.stringContaining( STAR_PATH ),
			url: null,
		} );
		expect( ( result as { html: string } ).html ).toContain( 'fill="currentColor"' );
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
