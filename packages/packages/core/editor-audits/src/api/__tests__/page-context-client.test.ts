import { httpService } from '@elementor/http-client';

import { SessionExpiredError } from '../../utils/session-expiration';
import { fetchPageContext } from '../page-context-client';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

const NONCE_INVALID_ERROR = { response: { status: 403, data: { code: 'rest_cookie_invalid_nonce' } } };

describe( 'fetchPageContext', () => {
	const originalFetch = global.fetch;

	beforeEach( () => {
		( window as unknown as { elementorAudits: unknown } ).elementorAudits = {
			audits: [],
			restNamespace: 'elementor/v1',
			nonce: 'fake-nonce',
		};
	} );

	afterEach( () => {
		global.fetch = originalFetch;
	} );

	it( 'calls the REST endpoint with the right URL, document id, and attachment ids', async () => {
		// Arrange.
		const mockHttp = jest.mocked( httpService );
		const get = jest.fn().mockResolvedValue( { data: { post_title: 'X' } } );
		mockHttp.mockReturnValue( { get } as unknown as ReturnType< typeof httpService > );

		// Act.
		await fetchPageContext( 42, [ 1, 2 ] );

		// Assert.
		expect( get ).toHaveBeenCalledWith(
			expect.stringContaining( 'elementor/v1/audits/page-context' ),
			expect.objectContaining( {
				params: expect.objectContaining( { document_id: 42 } ),
			} )
		);
	} );

	it( 'returns the response body', async () => {
		const mockHttp = jest.mocked( httpService );
		const expected = { post_title: 'Hello' };
		mockHttp.mockReturnValue( {
			get: jest.fn().mockResolvedValue( { data: expected } ),
		} as unknown as ReturnType< typeof httpService > );

		const result = await fetchPageContext( 1, [] );
		expect( result ).toEqual( expected );
	} );

	it( 'refreshes the nonce and retries once when the request fails with an invalid nonce', async () => {
		// Arrange.
		const expected = { post_title: 'Hello' };
		const get = jest.fn().mockRejectedValueOnce( NONCE_INVALID_ERROR ).mockResolvedValueOnce( { data: expected } );
		jest.mocked( httpService ).mockReturnValue( { get } as unknown as ReturnType< typeof httpService > );
		global.fetch = jest
			.fn()
			.mockResolvedValue( { ok: true, text: () => Promise.resolve( 'fresh-nonce' ) } ) as unknown as typeof fetch;

		// Act.
		const result = await fetchPageContext( 1, [] );

		// Assert.
		expect( result ).toEqual( expected );
		expect( get ).toHaveBeenCalledTimes( 2 );
		expect( get ).toHaveBeenNthCalledWith(
			2,
			expect.anything(),
			expect.objectContaining( { headers: { 'X-WP-Nonce': 'fresh-nonce' } } )
		);
	} );

	it( 'throws a SessionExpiredError and does not retry again when the nonce refresh also fails', async () => {
		// Arrange.
		const get = jest.fn().mockRejectedValue( NONCE_INVALID_ERROR );
		jest.mocked( httpService ).mockReturnValue( { get } as unknown as ReturnType< typeof httpService > );
		global.fetch = jest
			.fn()
			.mockResolvedValue( { ok: true, text: () => Promise.resolve( '0' ) } ) as unknown as typeof fetch;

		// Act & Assert.
		await expect( fetchPageContext( 1, [] ) ).rejects.toBeInstanceOf( SessionExpiredError );
		expect( get ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'propagates other errors without attempting a nonce refresh', async () => {
		// Arrange.
		const otherError = new Error( 'network down' );
		const get = jest.fn().mockRejectedValue( otherError );
		jest.mocked( httpService ).mockReturnValue( { get } as unknown as ReturnType< typeof httpService > );
		const fetchMock = jest.fn();
		global.fetch = fetchMock as unknown as typeof fetch;

		// Act & Assert.
		await expect( fetchPageContext( 1, [] ) ).rejects.toBe( otherError );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );
} );
