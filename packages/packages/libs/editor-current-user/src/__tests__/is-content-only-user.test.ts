import { type UserModel } from '../api';
import { getCurrentUser } from '../get-current-user';
import { isContentOnlyUser } from '../is-content-only-user';
import { DESIGN_RESTRICTION } from '../use-user-restrictions';

jest.mock( '../get-current-user' );

describe( 'isContentOnlyUser', () => {
	it( 'should return true when the design restriction is present', () => {
		// Arrange
		jest.mocked( getCurrentUser ).mockReturnValue( {
			restrictions: [ DESIGN_RESTRICTION ],
		} as UserModel );

		// Act
		const result = isContentOnlyUser();

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return false when the design restriction is absent', () => {
		// Arrange
		jest.mocked( getCurrentUser ).mockReturnValue( {
			restrictions: [ 'json-upload' ],
		} as UserModel );

		// Act
		const result = isContentOnlyUser();

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when there is no cached user', () => {
		// Arrange
		jest.mocked( getCurrentUser ).mockReturnValue( undefined );

		// Act
		const result = isContentOnlyUser();

		// Assert
		expect( result ).toBe( false );
	} );
} );
