import apiFetch from '@wordpress/api-fetch';

import { checkDesignSystem } from '../check-design-system';

jest.mock( '@wordpress/api-fetch' );

const mockedApiFetch = jest.mocked( apiFetch );

const respond = ( path: string ) => {
	if ( path === '/elementor/v1/variables/list' ) {
		return Promise.resolve( { success: true, data: { total: 4, variables: [] } } );
	}
	if ( path === '/elementor/v1/global-classes' ) {
		return Promise.resolve( { data: [ { id: 'a' }, { id: 'b' } ] } );
	}
	return Promise.resolve( {} );
};

describe( '@elementor/site-builder/deploy/check-design-system', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns the counts of variables and global classes on the active kit', async () => {
		// Arrange
		mockedApiFetch.mockImplementation( ( ( opts: { path: string } ) => respond( opts.path ) ) as unknown as typeof apiFetch );

		// Act
		const result = await checkDesignSystem();

		// Assert
		expect( result ).toEqual( { variables: 4, classes: 2 } );
	} );

	it( 'falls back to zero counts when an endpoint errors', async () => {
		// Arrange
		mockedApiFetch.mockImplementation( ( ( opts: { path: string } ) => {
			if ( opts.path === '/elementor/v1/variables/list' ) {
				return Promise.reject( new Error( 'rest down' ) );
			}
			return Promise.resolve( { data: [ { id: 'a' } ] } );
		} ) as unknown as typeof apiFetch );

		// Act
		const result = await checkDesignSystem();

		// Assert
		expect( result ).toEqual( { variables: 0, classes: 1 } );
	} );
} );
