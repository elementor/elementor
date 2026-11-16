import { type UseQueryResult } from '@elementor/query';
import { renderHook } from '@testing-library/react';

import { type User } from '../types';
import { useCurrentUser } from '../use-current-user';
import { useHasContentOnlyAccess } from '../use-has-content-only-access';
import { DESIGN_RESTRICTION, useUserRestrictions } from '../use-user-restrictions';

jest.mock( '../use-current-user' );

const mockRestrictions = ( restrictions: string[] ) => {
	jest.mocked( useCurrentUser ).mockReturnValue( {
		data: { restrictions },
	} as UseQueryResult< User, Error > );
};

describe( 'useUserRestrictions', () => {
	it( 'should report the restrictions it was given', () => {
		// Arrange
		mockRestrictions( [ 'json-upload' ] );

		// Act
		const { result } = renderHook( () => useUserRestrictions() );

		// Assert
		expect( result.current.restrictions ).toEqual( [ 'json-upload' ] );
		expect( result.current.isRestricted( 'json-upload' ) ).toBe( true );
		expect( result.current.isRestricted( DESIGN_RESTRICTION ) ).toBe( false );
	} );

	it( 'should report nothing as restricted while the user data is unavailable', () => {
		// Arrange
		jest.mocked( useCurrentUser ).mockReturnValue( {} as UseQueryResult< User, Error > );

		// Act
		const { result } = renderHook( () => useUserRestrictions() );

		// Assert
		expect( result.current.restrictions ).toBeUndefined();
		expect( result.current.isRestricted( DESIGN_RESTRICTION ) ).toBe( false );
	} );
} );

describe( 'useHasContentOnlyAccess', () => {
	it( 'should report content-only access when the design restriction is present', () => {
		// Arrange
		mockRestrictions( [ DESIGN_RESTRICTION ] );

		// Act
		const { result } = renderHook( () => useHasContentOnlyAccess() );

		// Assert
		expect( result.current ).toBe( true );
	} );

	it( 'should not report content-only access for unrelated restrictions', () => {
		// Arrange
		mockRestrictions( [ 'json-upload' ] );

		// Act
		const { result } = renderHook( () => useHasContentOnlyAccess() );

		// Assert
		expect( result.current ).toBe( false );
	} );

	it( 'should not report content-only access while the user data is unavailable', () => {
		// Arrange
		jest.mocked( useCurrentUser ).mockReturnValue( {} as UseQueryResult< User, Error > );

		// Act
		const { result } = renderHook( () => useHasContentOnlyAccess() );

		// Assert
		expect( result.current ).toBe( false );
	} );
} );
