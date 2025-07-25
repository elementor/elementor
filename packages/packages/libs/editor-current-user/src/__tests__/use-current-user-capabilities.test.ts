import { type UseQueryResult } from '@elementor/query';
import { renderHook } from '@testing-library/react';

import { type User } from '../types';
import { useCurrentUser } from '../use-current-user';
import { useCurrentUserCapabilities } from '../use-current-user-capabilities';

jest.mock( '../use-current-user' );

describe( 'useCurrentUserCapabilities', () => {
	it( 'should return true if user has the capability', async () => {
		jest.mocked( useCurrentUser ).mockReturnValue( {
			data: { capabilities: [ 'manage_options' ] },
		} as UseQueryResult< User, Error > );

		const { result } = renderHook( () => useCurrentUserCapabilities() );

		expect( result.current.canUser( 'manage_options' ) ).toBe( true );
	} );

	it( "should return false if user doesn't have the capability", async () => {
		jest.mocked( useCurrentUser ).mockReturnValue( {
			data: { capabilities: [] as string[] },
		} as UseQueryResult< User, Error > );

		const { result } = renderHook( () => useCurrentUserCapabilities() );

		expect( result.current.canUser( 'manage_options' ) ).toBe( false );
	} );

	it( 'should return false if data is undefined', async () => {
		jest.mocked( useCurrentUser ).mockReturnValue( {} as UseQueryResult< User, Error > );

		const { result } = renderHook( () => useCurrentUserCapabilities() );

		expect( result.current.canUser( 'manage_options' ) ).toBe( false );
	} );
} );
