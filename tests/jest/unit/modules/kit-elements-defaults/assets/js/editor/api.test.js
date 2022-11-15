import { getElementDefaults, deleteElementDefaults, updateElementDefaults, loadElementsDefaults } from 'elementor/modules/kit-elements-defaults/assets/js/editor/api';

describe( 'modules/kit-elements-defaults/assets/js/editor/api.js', () => {
	beforeEach( () => {
		window.$e = {
			data: {
				get: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
				cache: {
					storage: {
						removeItem: jest.fn(),
						getItem: jest.fn(),
					},
				},
			},
		};
	} );

	afterEach( () => {
		jest.clearAllMocks();
		delete window.$e;
	} );

	it( 'Should load defaults to cache', async () => {
		// Act.
		await loadElementsDefaults();

		// Assert.
		expect( $e.data.cache.storage.removeItem ).toHaveBeenCalledTimes( 1 );
		expect( $e.data.cache.storage.removeItem ).toHaveBeenCalledWith( 'kit-elements-defaults' );

		expect( $e.data.get ).toHaveBeenCalledTimes( 1 );
		expect( $e.data.get ).toHaveBeenCalledWith( 'kit-elements-defaults/index' );
	} );

	it( 'Should return empty object for non-existing type', () => {
		// Arrange.
		$e.data.cache.storage.getItem.mockReturnValue( {
			'existing-element': { some: 'settings' },
		} );

		// Act & Assert.
		expect( getElementDefaults( 'non-existing-element' ) ).toStrictEqual( {} );
	} );

	it( 'Should read element defaults from cache', () => {
		// Arrange.
		$e.data.cache.storage.getItem.mockReturnValue( {
			'existing-element': { some: 'settings' },
			'existing-element2': { some: 'settings2' },
		} );

		// Act.
		const result = getElementDefaults( 'existing-element' );

		// Assert.
		expect( result ).toEqual( { some: 'settings' } );
	} );

	it( 'Should update element defaults and reload cache', async () => {
		// Act.
		await updateElementDefaults( 'section', {
			new_control: 'new_value',
		} );

		// Assert.
		expect( $e.data.update ).toHaveBeenCalledTimes( 1 );
		expect( $e.data.update ).toHaveBeenCalledWith(
			'kit-elements-defaults/index',
			{ settings: { new_control: 'new_value' } },
			{ type: 'section' },
		);

		expect( $e.data.cache.storage.removeItem ).toHaveBeenCalledTimes( 1 );
		expect( $e.data.cache.storage.removeItem ).toHaveBeenCalledWith( 'kit-elements-defaults' );

		expect( $e.data.get ).toHaveBeenCalledTimes( 1 );
		expect( $e.data.get ).toHaveBeenCalledWith( 'kit-elements-defaults/index' );
	} );

	it( 'Should delete element defaults and reload cache', async () => {
		// Act.
		await deleteElementDefaults( 'section' );

		// Assert.
		expect( $e.data.delete ).toHaveBeenCalledTimes( 1 );
		expect( $e.data.delete ).toHaveBeenCalledWith(
			'kit-elements-defaults/index',
			{ type: 'section' },
		);

		expect( $e.data.cache.storage.removeItem ).toHaveBeenCalledTimes( 1 );
		expect( $e.data.cache.storage.removeItem ).toHaveBeenCalledWith( 'kit-elements-defaults' );

		expect( $e.data.get ).toHaveBeenCalledTimes( 1 );
		expect( $e.data.get ).toHaveBeenCalledWith( 'kit-elements-defaults/index' );
	} );
} );
