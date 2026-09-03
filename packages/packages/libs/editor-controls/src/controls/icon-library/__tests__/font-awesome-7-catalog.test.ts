import {
	createIconSelectionValue,
	filterFontAwesome7Icons,
	findFontAwesome7Icon,
	type FontAwesome7Icon,
	getSelectedIconId,
	loadFontAwesome7Catalog,
} from '../font-awesome-7-catalog';

const STAR_PATH = 'M0 0h100v100H0z';

function createIcon( overrides: Partial< FontAwesome7Icon > = {} ): FontAwesome7Icon {
	return {
		id: 'fa-solid:star',
		name: 'star',
		label: 'star',
		library: 'fa-solid',
		value: 'fa-solid fa-star',
		aliases: [ 'favorite' ],
		width: 576,
		height: 512,
		paths: [ STAR_PATH ],
		...overrides,
	};
}

describe( 'font-awesome-7-catalog', () => {
	const originalElementorCommon = window.elementorCommon;

	beforeEach( () => {
		window.elementorCommon = {
			config: {
				fontAwesome: {
					v7: {
						jsonFiles: [ 'solid', 'regular', 'brands' ],
						jsonBaseUrl: 'https://example.com/assets/lib/font-awesome-7/json/',
					},
				},
			},
		} as typeof window.elementorCommon;
	} );

	afterEach( () => {
		window.elementorCommon = originalElementorCommon;
		jest.restoreAllMocks();
	} );

	it( 'loads allowlisted libraries and skips invalid tuples', async () => {
		// Arrange.
		global.fetch = jest.fn().mockImplementation( ( url: string ) => {
			const icons = url.includes( 'solid.json' )
				? {
						star: [ 576, 512, [ 'favorite' ], 'f005', STAR_PATH ],
						broken: [ 'bad' ],
				  }
				: {};

			return Promise.resolve( {
				ok: true,
				json: () => Promise.resolve( { icons } ),
			} );
		} );

		// Act.
		const catalog = await loadFontAwesome7Catalog();

		// Assert.
		expect( global.fetch ).toHaveBeenCalledTimes( 3 );
		expect( catalog ).toEqual( [
			expect.objectContaining( {
				id: 'fa-solid:star',
				name: 'star',
				library: 'fa-solid',
				value: 'fa-solid fa-star',
				aliases: [ 'favorite' ],
			} ),
		] );
	} );

	it( 'filters by name and alias', () => {
		// Arrange.
		const icons = [
			createIcon(),
			createIcon( {
				id: 'fa-regular:circle',
				name: 'circle',
				label: 'circle',
				library: 'fa-regular',
				value: 'fa-regular fa-circle',
				aliases: [],
			} ),
		];

		// Act / Assert.
		expect( filterFontAwesome7Icons( icons, 'STAR' ) ).toHaveLength( 1 );
		expect( filterFontAwesome7Icons( icons, 'favorite' ) ).toHaveLength( 1 );
		expect( filterFontAwesome7Icons( icons, 'missing' ) ).toHaveLength( 0 );
	} );

	it( 'normalizes fas and fa-solid selected values', () => {
		// Arrange / Act / Assert.
		expect( createIconSelectionValue( 'fa-solid', 'star' ) ).toBe( 'fa-solid fa-star' );
		expect( getSelectedIconId( 'fas fa-star', 'fa-solid' ) ).toBe( 'fa-solid:star' );
		expect( getSelectedIconId( 'fa-solid fa-star', 'fa-solid' ) ).toBe( 'fa-solid:star' );
		expect( findFontAwesome7Icon( [ createIcon() ], 'fas fa-star', 'fa-solid' )?.id ).toBe( 'fa-solid:star' );
	} );
} );
