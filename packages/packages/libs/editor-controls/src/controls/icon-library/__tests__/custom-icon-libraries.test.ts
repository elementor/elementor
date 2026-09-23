import { httpService } from '@elementor/http-client';

import {
	isDeletedCustomIconLibrary,
	loadCustomIconLibraries,
	resetCustomIconSvgCache,
} from '../custom-icon-libraries';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

const MY_ICONS_CONFIG = {
	name: 'my-icons',
	label: 'My Icons',
	prefix: 'my-icons-',
	displayPrefix: 'my-icons',
	fetchJson: 'https://example.com/uploads/my-icons.js',
	native: false,
};

describe( 'custom-icon-libraries', () => {
	const originalElementor = window.elementor;
	const get = jest.fn();

	beforeEach( () => {
		resetCustomIconSvgCache();
		get.mockResolvedValue( { data: { data: { icons: {} }, meta: {} } } );
		jest.mocked( httpService ).mockReturnValue( { get } as never );
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{ name: 'all', label: 'All Icons', native: true },
						{ name: 'fa-solid', label: 'Font Awesome - Solid', prefix: 'fa-', native: true },
						MY_ICONS_CONFIG,
					],
				},
			},
			helpers: {
				enqueueIconFonts: jest.fn(),
			},
		} as typeof window.elementor;
	} );

	afterEach( () => {
		window.elementor = originalElementor;
		jest.restoreAllMocks();
	} );

	it( 'loads name-only custom libraries and skips native tabs', async () => {
		// Arrange.
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			json: () => Promise.resolve( { icons: [ 'badge', 'spark' ] } ),
		} );

		// Act.
		const catalog = await loadCustomIconLibraries();

		// Assert.
		expect( global.fetch ).toHaveBeenCalledWith(
			MY_ICONS_CONFIG.fetchJson,
			expect.objectContaining( { mode: 'cors' } )
		);
		expect( window.elementor?.helpers?.enqueueIconFonts ).toHaveBeenCalledWith( 'my-icons' );
		expect( catalog ).toEqual( [
			expect.objectContaining( {
				id: 'my-icons:badge',
				library: 'my-icons',
				value: 'my-icons my-icons-badge',
				glyphClass: 'my-icons my-icons-badge',
			} ),
			expect.objectContaining( {
				id: 'my-icons:spark',
				value: 'my-icons my-icons-spark',
			} ),
		] );
	} );

	it( 'accepts numeric custom library names', async () => {
		// Arrange.
		global.fetch = jest.fn();
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{
							name: -1,
							prefix: 'icon-',
							displayPrefix: '',
							icons: [ 'emo-surprised' ],
							native: false,
						},
					],
				},
			},
			helpers: { enqueueIconFonts: jest.fn() },
		} as typeof window.elementor;

		// Act.
		const catalog = await loadCustomIconLibraries();

		// Assert.
		expect( catalog[ 0 ] ).toEqual(
			expect.objectContaining( {
				id: '-1:emo-surprised',
				library: '-1',
				value: 'icon icon-emo-surprised',
			} )
		);
		expect( get ).toHaveBeenCalledWith(
			'elementor/v1/atomic-widgets/custom-icon-svg',
			expect.objectContaining( { params: { library: '-1' } } )
		);
	} );

	it( 'parses fontello.svg when the rest map is empty', async () => {
		// Arrange.
		const font = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><defs><font horiz-adv-x="1000"><font-face units-per-em="1000"/><glyph glyph-name="emo-surprised" unicode="&#xe800;" d="M0 0H100V100H0Z" horiz-adv-x="696"/></font></defs></svg>`;
		const config = JSON.stringify( { glyphs: [ { css: 'emo-surprised', code: 59392 } ] } );
		global.fetch = jest.fn( ( input: RequestInfo | URL ) => {
			const url = String( input );

			if ( url.endsWith( 'font/fontello.svg' ) ) {
				return Promise.resolve( { ok: true, text: () => Promise.resolve( font ) } );
			}

			return Promise.resolve( {
				ok: true,
				text: () => Promise.resolve( config ),
				json: () => Promise.resolve( JSON.parse( config ) ),
			} );
		} ) as jest.Mock;
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{
							name: '-1',
							prefix: 'icon-',
							displayPrefix: '',
							fetchJson: 'https://example.com/uploads/elementor/custom-icons/-1/config.json',
							icons: [ 'emo-surprised' ],
							native: false,
						},
					],
				},
			},
			helpers: { enqueueIconFonts: jest.fn() },
		} as typeof window.elementor;

		// Act.
		const catalog = await loadCustomIconLibraries();

		// Assert.
		expect( catalog[ 0 ]?.svgMarkup ).toContain( 'M0 0H100V100H0Z' );
	} );

	it( 'attaches svg markup from the custom icon svg endpoint', async () => {
		// Arrange.
		const markup = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1"></path></svg>';
		get.mockResolvedValue( {
			data: {
				data: { icons: { 'my-icons my-icons-badge': markup } },
				meta: {},
			},
		} );
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{
							name: 'my-icons',
							prefix: 'my-icons-',
							displayPrefix: 'my-icons',
							icons: [ 'badge' ],
							native: false,
						},
					],
				},
			},
			helpers: { enqueueIconFonts: jest.fn() },
		} as typeof window.elementor;

		// Act.
		const catalog = await loadCustomIconLibraries();

		// Assert.
		expect( get ).toHaveBeenCalledWith(
			'elementor/v1/atomic-widgets/custom-icon-svg',
			expect.objectContaining( { params: { library: 'my-icons' } } )
		);
		expect( catalog[ 0 ]?.svgMarkup ).toBe( markup );
	} );

	it( 'detects a deleted custom library from a leftover selection', () => {
		// Assert.
		expect( isDeletedCustomIconLibrary( 'my-icons', 'my-icons my-icons-badge' ) ).toBe( false );

		// Arrange.
		window.elementor = {
			config: { icons: { libraries: [ { name: 'fa-solid', native: true } ] } },
		} as typeof window.elementor;

		// Assert.
		expect( isDeletedCustomIconLibrary( 'missing-set', 'missing-set missing-set-ghost' ) ).toBe( true );
	} );
} );
