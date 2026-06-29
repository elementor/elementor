import { type UseQueryResult } from '@elementor/query';
import { renderHook } from '@testing-library/react';

import { type User } from '../types';
import { useCurrentUser } from '../use-current-user';
import { ADMIN_CAPABILITY, useCurrentUserCapabilities } from '../use-current-user-capabilities';

jest.mock( '../use-current-user' );

describe( 'useCurrentUserCapabilities', () => {
	it( 'should return true if user has the capability', async () => {
		jest.mocked( useCurrentUser ).mockReturnValue( {
			data: { capabilities: [ 'some_capability' ] },
		} as UseQueryResult< User, Error > );

		const { result } = renderHook( () => useCurrentUserCapabilities() );

		expect( result.current.canUser( 'some_capability' ) ).toBe( true );
	} );

	it( "should return false if user doesn't have the capability", async () => {
		jest.mocked( useCurrentUser ).mockReturnValue( {
			data: { capabilities: [] as string[] },
		} as UseQueryResult< User, Error > );

		const { result } = renderHook( () => useCurrentUserCapabilities() );

		expect( result.current.canUser( 'some_capability' ) ).toBe( false );
		expect( result.current.isAdmin ).toBe( false );
	} );

	it( 'should return false if data is undefined', async () => {
		jest.mocked( useCurrentUser ).mockReturnValue( {} as UseQueryResult< User, Error > );

		const { result } = renderHook( () => useCurrentUserCapabilities() );

		expect( result.current.canUser( 'some_capability' ) ).toBe( false );
	} );

	it( 'should return true if user has the admin capability', async () => {
		jest.mocked( useCurrentUser ).mockReturnValue( {
			data: { capabilities: [ ADMIN_CAPABILITY ] },
		} as UseQueryResult< User, Error > );

		const { result } = renderHook( () => useCurrentUserCapabilities() );

		expect( result.current.isAdmin ).toBe( true );
	} );
} );
