/**
 * @jest-environment node
 */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { initEnv } from '@elementor/env';

import { httpService } from '../http';

const server = setupServer();

describe( 'http-client', () => {
	beforeAll( () => {
		server.listen();
	} );

	afterAll( () => {
		server.close();
	} );

	beforeEach( () => {
		initEnv( {
			'@elementor/http-client': {
				base_url: 'http://localhost',
				headers: {
					'X-Test': 'test-value',
				},
			},
		} );
	} );

	afterEach( () => {
		server.resetHandlers();
	} );

	it( 'should send a basic http request with valid headers and base url', async () => {
		// Arrange.
		server.use( http.get( 'http://localhost', () => HttpResponse.json( { data: 'test' } ) ) );

		// Act.
		const response = await httpService().get( 'http://localhost' );

		// Assert.
		expect( response.config.baseURL ).toEqual( 'http://localhost' );
		expect( response.config.headers[ 'X-Test' ] ).toEqual( 'test-value' );
		expect( response.data ).toEqual( { data: 'test' } );
	} );
} );
