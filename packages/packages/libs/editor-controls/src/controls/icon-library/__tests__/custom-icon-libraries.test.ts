import {
	isDeletedCustomIconLibrary,
	loadCustomIconLibraries,
	resetCustomIconLibrariesCache,
	resolveCustomIcon,
} from '../custom-icon-libraries';

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

	beforeEach( () => {
		resetCustomIconLibrariesCache();
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{ name: 'all', label: 'All Icons', native: true },
						{ name: 'fa-solid', label: 'Font Awesome - Solid', prefix: 'fa-', native: true },
						MY_ICONS_CONFIG,
						{
							name: 'empty-set',
							label: 'Empty',
							prefix: 'empty-',
							displayPrefix: 'empty',
							native: false,
						},
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
		resetCustomIconLibrariesCache();
		jest.restoreAllMocks();
	} );

	it( 'loads name-only custom libraries and skips native tabs', async () => {
		// Arrange.
		global.fetch = jest.fn().mockImplementation( ( url: string ) => {
			if ( url.endsWith( 'my-icons.js' ) ) {
				return Promise.resolve( {
					ok: true,
					json: () => Promise.resolve( { icons: [ 'badge', 'spark' ] } ),
				} );
			}

			return Promise.resolve( {
				ok: false,
				json: () => Promise.resolve( {} ),
				text: () => Promise.resolve( '' ),
			} );
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

	it( 'does not double-prefix glyph names that already include the prefix', async () => {
		// Arrange.
		window.elementor = {
			config: {
				icons: {
					libraries: [
						{
							name: 'emo',
							label: 'Emo',
							prefix: 'emo-',
							displayPrefix: 'emo',
							fetchJson: 'https://example.com/uploads/emo.js',
							native: false,
						},
					],
				},
			},
			helpers: {
				enqueueIconFonts: jest.fn(),
			},
		} as typeof window.elementor;
		global.fetch = jest.fn().mockImplementation( ( url: string ) => {
			if ( url.endsWith( 'emo.js' ) ) {
				return Promise.resolve( {
					ok: true,
					json: () => Promise.resolve( { icons: [ 'emo-surprised' ] } ),
				} );
			}

			if ( url.endsWith( 'emo-surprised.svg' ) ) {
				return Promise.resolve( {
					ok: true,
					text: () =>
						Promise.resolve(
							'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><path d="M3 3"></path></svg>'
						),
				} );
			}

			return Promise.resolve( {
				ok: false,
				json: () => Promise.resolve( {} ),
				text: () => Promise.resolve( '' ),
			} );
		} );

		// Act.
		const catalog = await loadCustomIconLibraries();

		// Assert.
		expect( catalog ).toEqual( [
			expect.objectContaining( {
				name: 'emo-surprised',
				value: 'emo emo-surprised',
				glyphClass: 'emo emo-surprised',
				svgMarkup: expect.stringContaining( 'M3 3' ),
			} ),
		] );
	} );

	it( 'returns empty catalog when fetch fails', async () => {
		// Arrange.
		global.fetch = jest.fn().mockRejectedValue( new Error( 'network' ) );

		// Act.
		const catalog = await loadCustomIconLibraries();

		// Assert.
		expect( catalog ).toEqual( [] );
	} );

	it( 'resolves custom icons that include svg markup', async () => {
		// Arrange.
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			json: () =>
				Promise.resolve( {
					icons: {
						badge: {
							svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1"></path></svg>',
						},
					},
				} ),
		} );

		// Act.
		const icon = await resolveCustomIcon( 'my-icons', 'my-icons my-icons-badge' );

		// Assert.
		expect( icon?.svgMarkup ).toContain( '<svg' );
		expect( icon?.name ).toBe( 'badge' );
	} );

	it( 'strips script from custom svg markup', async () => {
		// Arrange.
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			json: () =>
				Promise.resolve( {
					icons: {
						badge: {
							svg: '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><path d="M1 1"></path></svg>',
						},
					},
				} ),
		} );

		// Act.
		const icon = await resolveCustomIcon( 'my-icons', 'my-icons my-icons-badge' );

		// Assert.
		expect( icon?.svgMarkup ).toContain( '<path' );
		expect( icon?.svgMarkup ).not.toContain( 'script' );
		expect( icon?.svgMarkup ).not.toContain( 'onload' );
		expect( icon?.svgMarkup ).not.toContain( 'alert' );
	} );

	it( 'reuses a cached catalog instead of refetching json for each icon', async () => {
		// Arrange.
		global.fetch = jest.fn().mockResolvedValue( {
			ok: true,
			json: () =>
				Promise.resolve( {
					icons: {
						badge: {
							svg: '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1"></path></svg>',
						},
						spark: {
							svg: '<svg xmlns="http://www.w3.org/2000/svg"><path d="M2 2"></path></svg>',
						},
					},
				} ),
		} );

		// Act.
		await resolveCustomIcon( 'my-icons', 'my-icons my-icons-badge' );
		await resolveCustomIcon( 'my-icons', 'my-icons my-icons-spark' );

		// Assert.
		const jsonFetches = jest.mocked( global.fetch ).mock.calls.filter( ( [ url ] ) => url === MY_ICONS_CONFIG.fetchJson );

		expect( jsonFetches ).toHaveLength( 1 );
	} );

	it( 'fetches a sibling svg when the catalog only has icon names', async () => {
		// Arrange.
		global.fetch = jest.fn().mockImplementation( ( url: string ) => {
			if ( url.endsWith( 'my-icons.js' ) ) {
				return Promise.resolve( {
					ok: true,
					json: () => Promise.resolve( { icons: [ 'badge' ] } ),
				} );
			}

			if ( url.endsWith( 'badge.svg' ) ) {
				return Promise.resolve( {
					ok: true,
					text: () =>
						Promise.resolve(
							'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><path d="M2 2"></path></svg>'
						),
				} );
			}

			return Promise.resolve( {
				ok: false,
				json: () => Promise.resolve( {} ),
				text: () => Promise.resolve( '' ),
			} );
		} );

		// Act.
		const icon = await resolveCustomIcon( 'my-icons', 'my-icons my-icons-badge' );

		// Assert.
		expect( icon?.svgMarkup ).toContain( 'M2 2' );
	} );

	it( 'detects a deleted custom library from a leftover selection', () => {
		// Arrange.
		window.elementor = {
			config: { icons: { libraries: [ { name: 'fa-solid', native: true } ] } },
		} as typeof window.elementor;

		// Act.
		const isDeleted = isDeletedCustomIconLibrary( 'missing-set', 'missing-set missing-set-ghost' );

		// Assert.
		expect( isDeleted ).toBe( true );
	} );

	it( 'does not treat a registered custom library as deleted', () => {
		// Act.
		const isDeleted = isDeletedCustomIconLibrary( 'my-icons', 'my-icons my-icons-badge' );

		// Assert.
		expect( isDeleted ).toBe( false );
	} );
} );
