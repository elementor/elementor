import store from 'elementor/modules/kit-elements-defaults/assets/js/editor/store';

describe( 'modules/kit-elements-defaults/assets/js/editor/store.js', () => {
	beforeEach( () => {
		window.wpApiSettings = {
			root: 'http://example.com/wp-json/',
			nonce: '123456',
		};
	} );

	it( 'Should load items to cache', async () => {
		// Arrange.
		mockFetch( {
			method: 'GET',
			endpoint: '/',
			response: {
				status: 200,
				body: {
					section: {
						color: 'red',
						background_color: '#F00',
					},
					button: {
						type: 'info',
					},
				},
			},
		} );

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

		mockFetch( [
			{
				method: 'PUT',
				endpoint: '/section',
				response: {
					status: 201,
					body: '',
				},
			},
			{
				method: 'GET',
				endpoint: '/',
				response: {
					status: 200,
					body: {
						section: {
							new_control: 'new_value',
						},
					},
				},
			},
		] );

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

		mockFetch( [
			{
				method: 'DELETE',
				endpoint: '/section',
				response: {
					status: 204,
					body: '',
				},
			},
			{
				method: 'GET',
				endpoint: '/',
				response: {
					status: 200,
					body: {},
				},
			},
		] );

		// Act.
		await store.delete( 'section' );

		// Assert.
		const section = store.get( 'section' );

		expect( section ).toStrictEqual( {} );
	} );

	it( 'Should send proper auth headers', async () => {
		// Arrange.
		let headers = {};

		window.fetch = jest.fn( ( _, { headers: reqHeaders } ) => {
			headers = reqHeaders;

			return Promise.resolve( {
				ok: true,
				status: 200,
				text: () => Promise.resolve( '{}' ),
			} );
		} );

		// Act.
		await store.load();

		// Assert.
		expect( headers ).toStrictEqual( {
			'Content-Type': 'application/json',
			'X-WP-Nonce': '123456',
		} );
	} );

	it( 'Should throw for invalid response', async () => {
		// Arrange.
		mockFetch( {
			method: 'GET',
			endpoint: '/',
			response: {
				status: 500,
				body: '',
			},
		} );

		// Act & Assert.
		await expect( store.load() ).rejects.toStrictEqual( {
			ok: false,
			status: 500,
			text: expect.any( Function ),
		} );
	} );
} );

function mockFetch( mocks ) {
	if ( ! Array.isArray( mocks ) ) {
		mocks = [ mocks ];
	}

	const BASE_URL = wpApiSettings.root + 'elementor/v1/kit-elements-defaults';

	window.fetch = jest.fn( ( reqURL, reqOptions ) => {
		const match = mocks.find( ( res ) => (
			res.method === reqOptions.method && BASE_URL + res.endpoint === reqURL
		) );

		if ( ! match ) {
			return Promise.reject( 'No matching response found' );
		}

		const { status, body } = match.response;

		return Promise.resolve( {
			ok: status >= 200 && status < 300,
			status,
			text: () => Promise.resolve( JSON.stringify( body ) ),
		} );
	} );
}
