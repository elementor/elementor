import { registerDataHook } from '@elementor/editor-v1-adapters';
import { type QueryClient } from '@elementor/query';

import { ensureCurrentUser } from '../ensure-current-user';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	registerDataHook: jest.fn(),
} ) );

describe( 'ensureCurrentUser', () => {
	it( 'should not fail the attach preview command is user fetch failed', async () => {
		// Arrange.
		const queryClient = {
			ensureQueryData: jest.fn().mockRejectedValue( new Error( 'Failed to fetch current user' ) ),
			setQueryData: jest.fn(),
			getQueryData: jest.fn().mockReturnValue( null ),
		} as unknown as QueryClient;

		jest.mocked( registerDataHook ).mockImplementation( ( _hook, _command, callback ) => {
			return callback( {} ) as never;
		} );

		// Act.
		const result = await ensureCurrentUser( { queryClient } );

		// Assert.
		expect( queryClient.ensureQueryData ).toHaveBeenCalledWith( {
			queryKey: [ 'editor-current-user' ],
			queryFn: expect.any( Function ),
			retry: false,
		} );

		expect( result ).toBeNull();
	} );
} );
