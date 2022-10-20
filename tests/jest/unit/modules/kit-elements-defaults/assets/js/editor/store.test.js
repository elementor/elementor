import store from 'elementor/modules/kit-elements-defaults/assets/js/editor/store';

describe( 'modules/kit-elements-defaults/assets/js/editor/store.js', () => {
	beforeEach( () => {
		window.$e = {
			api: {
				get: jest.fn(),
				put: jest.fn(),
				delete: jest.fn(),
			},
		};
	} );

	afterEach( () => {
		delete window.$e;
	} );

	it( 'Should return empty object for non-existing type', () => {
		// Act & Assert.
		expect( store.get( 'non-existing-element' ) ).toStrictEqual( {} );
	} );

	it( 'Should load items to cache', async () => {
		// Arrange.
		$e.api.get.mockImplementation( () => ( {
			data: {
				section: {
					color: 'red',
					background_color: '#F00',
				},
				button: {
					type: 'info',
				},
			},
		} ) );

		// Act.
		await store.load();

		// Assert.
		const section = store.get( 'section' );
		const button = store.get( 'button' );

		expect( section ).toStrictEqual( {
			color: 'red',
			background_color: '#F00',
		} );

		expect( button ).toStrictEqual( {
			type: 'info',
		} );
	} );

	it( 'Should upsert and refresh cache', async () => {
		// Arrange.
		store.items = {
			section: {
				old_control: 'old_value',
			},
		};

		$e.api.put.mockImplementation( () => ( { data: null } ) );

		$e.api.get.mockImplementation( () => ( {
			data: {
				section: {
					new_control: 'new_value',
				},
			},
		} ) );

		// Act.
		await store.upsert( 'section', {
			new_control: 'new_value',
		} );

		// Assert.
		const section = store.get( 'section' );

		expect( section ).toStrictEqual( {
			new_control: 'new_value',
		} );
	} );

	it( 'Should delete and refresh cache', async () => {
		// Arrange.
		store.items = {
			section: {
				old_control: 'old_value',
			},
		};

		$e.api.delete.mockImplementation( () => ( {
			data: '',
		} ) );

		$e.api.get.mockImplementation( () => ( {
			data: {},
		} ) );

		// Act.
		await store.delete( 'section' );

		// Assert.
		const section = store.get( 'section' );

		expect( section ).toStrictEqual( {} );
	} );
} );
