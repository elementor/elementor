import store from 'elementor/modules/kit-elements-defaults/assets/js/editor/store';
import { mockFetch } from './utils';

const wpApiSettings = {
	root: 'http://example.com/wp-json/',
	nonce: '123456',
};

const BASE_URL = wpApiSettings.root + 'elementor/v1/kit-elements-defaults';

describe( 'modules/kit-elements-defaults/assets/js/editor/store.js', () => {
	beforeEach( () => {
		window.wpApiSettings = wpApiSettings;
	} );

	it( 'Should load items to cache', async () => {
		// Arrange.
		mockFetch( BASE_URL )
			.get( '/' )
			.reply( {
				section: {
					color: 'red',
					background_color: '#F00',
				},
				button: {
					type: 'info',
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

		mockFetch( BASE_URL )
			.put( '/section' )
			.reply( '', 201 )
			.get( '/' )
			.reply( {
				section: {
					new_control: 'new_value',
				},
			} );

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

		mockFetch( BASE_URL )
			.delete( '/section' )
			.reply( '', 204 )
			.get( '/' )
			.reply( {} );

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
		mockFetch( BASE_URL )
			.get( '/' )
			.reply( '', 500 );

		// Act & Assert.
		await expect( store.load() ).rejects.toStrictEqual( {
			ok: false,
			status: 500,
			text: expect.any( Function ),
		} );
	} );
} );
