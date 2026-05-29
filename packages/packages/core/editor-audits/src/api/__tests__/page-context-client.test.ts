import { httpService } from '@elementor/http-client';

import { fetchPageContext } from '../page-context-client';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

describe( 'fetchPageContext', () => {
	beforeEach( () => {
		( window as unknown as { elementorAudits: unknown } ).elementorAudits = {
			audits: [],
			restNamespace: 'elementor/v1',
			nonce: 'fake-nonce',
		};
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
			expect.stringContaining( '/elementor/v1/audits/page-context' ),
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
} );
