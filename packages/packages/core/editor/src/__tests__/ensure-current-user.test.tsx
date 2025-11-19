import { ensureUser } from '@elementor/editor-current-user';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { ensureCurrentUser } from '../ensure-current-user';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	registerDataHook: jest.fn(),
} ) );

jest.mock( '@elementor/editor-current-user', () => ( {
	ensureUser: jest.fn(),
} ) );

describe( 'ensureCurrentUser', () => {
	it( 'should not fail the attach preview command if user fetch failed', async () => {
		// Arrange.
		jest.mocked( registerDataHook ).mockImplementation( ( _hook, _command, callback ) => {
			return callback( {}, undefined ) as never;
		} );

		jest.mocked( ensureUser ).mockRejectedValue( new Error( 'User fetch failed' ) );

		// Act.
		await ensureCurrentUser();

		// Assert.
		expect( registerDataHook ).toHaveBeenCalledWith(
			'after',
			'editor/documents/attach-preview',
			expect.any( Function )
		);

		expect( ensureUser ).toHaveBeenCalled();

		expect( ensureCurrentUser ).not.toThrow( 'User fetch failed' );
	} );
} );
