import { isDeletedCustomIconLibrary, loadCustomIconLibraries } from '../custom-icon-libraries';

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
