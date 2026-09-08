import apiFetch from '@wordpress/api-fetch';

import { installAndActivatePlugin } from '../install-plugin';

jest.mock( '@wordpress/api-fetch' );

const apiFetchMock = apiFetch as jest.MockedFunction< typeof apiFetch >;

describe( 'installAndActivatePlugin', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'installs and activates the plugin by slug', async () => {
		// Arrange.
		apiFetchMock.mockResolvedValue( { plugin: 'cookiez/cookiez.php', status: 'active', name: 'Cookiez' } );

		// Act.
		const result = await installAndActivatePlugin( 'cookiez', 'cookiez/cookiez.php' );

		// Assert.
		expect( result ).toEqual( { success: true } );
		expect( apiFetchMock ).toHaveBeenCalledWith( {
			path: '/wp/v2/plugins',
			method: 'POST',
			data: { slug: 'cookiez', status: 'active' },
		} );
	} );

	it( 'activates the existing plugin folder when install fails with folder_exists', async () => {
		// Arrange.
		apiFetchMock
			.mockRejectedValueOnce( { code: 'folder_exists', message: 'Destination folder already exists.' } )
			.mockResolvedValueOnce( { plugin: 'cookiez/cookiez.php', status: 'active', name: 'Cookiez' } );

		// Act.
		const result = await installAndActivatePlugin( 'cookiez', 'cookiez/cookiez.php' );

		// Assert.
		expect( result ).toEqual( { success: true } );
		expect( apiFetchMock ).toHaveBeenNthCalledWith( 2, {
			path: '/wp/v2/plugins/cookiez/cookiez.php',
			method: 'POST',
			data: { status: 'active' },
		} );
	} );

	it( 'returns a failure result with the error code and message on other errors', async () => {
		// Arrange.
		apiFetchMock.mockRejectedValue( { code: 'rest_forbidden', message: 'Sorry, you are not allowed to do that.' } );

		// Act.
		const result = await installAndActivatePlugin( 'cookiez', 'cookiez/cookiez.php' );

		// Assert.
		expect( result ).toEqual( {
			success: false,
			error: 'Sorry, you are not allowed to do that.',
			code: 'rest_forbidden',
		} );
	} );

	it( 'returns a generic failure result when the error is not a recognizable plugin error', async () => {
		// Arrange.
		apiFetchMock.mockRejectedValue( new Error( 'network down' ) );

		// Act.
		const result = await installAndActivatePlugin( 'cookiez', 'cookiez/cookiez.php' );

		// Assert.
		expect( result ).toEqual( { success: false, error: 'Unknown error occurred' } );
	} );
} );
