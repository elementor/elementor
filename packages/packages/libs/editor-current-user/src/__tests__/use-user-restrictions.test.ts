import { type UseQueryResult } from '@elementor/query';
import { renderHook } from '@testing-library/react';

import { type User } from '../types';
import { useCurrentUser } from '../use-current-user';
import { DESIGN_RESTRICTION, useUserRestrictions } from '../use-user-restrictions';

jest.mock( '../use-current-user' );

const mockRestrictions = ( restrictions: string[] ) => {
	jest.mocked( useCurrentUser ).mockReturnValue( {
		data: { restrictions },
	} as UseQueryResult< User, Error > );
};

describe( 'useUserRestrictions', () => {
	it( 'should report content-only access when the design restriction is present', () => {
		// Arrange
		mockRestrictions( [ DESIGN_RESTRICTION ] );

		// Act
		const { result } = renderHook( () => useUserRestrictions() );

		// Assert
		expect( result.current.hasContentOnlyAccess ).toBe( true );
		expect( result.current.isRestricted( DESIGN_RESTRICTION ) ).toBe( true );
	} );

	it( 'should not report content-only access for unrelated restrictions', () => {
		// Arrange
		mockRestrictions( [ 'json-upload' ] );

		// Act
		const { result } = renderHook( () => useUserRestrictions() );

		// Assert
		expect( result.current.hasContentOnlyAccess ).toBe( false );
		expect( result.current.isRestricted( 'json-upload' ) ).toBe( true );
	} );

	it( 'should not report content-only access while the user data is unavailable', () => {
		// Arrange
		jest.mocked( useCurrentUser ).mockReturnValue( {} as UseQueryResult< User, Error > );

		// Act
		const { result } = renderHook( () => useUserRestrictions() );

		// Assert
		expect( result.current.hasContentOnlyAccess ).toBe( false );
		expect( result.current.restrictions ).toBeUndefined();
	} );
} );
