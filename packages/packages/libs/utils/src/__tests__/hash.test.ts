import { hashString } from '../hash';

const LOWERCASE_ALPHANUMERIC_REGEX = /^[0-9a-z]+$/;

describe( 'hashString', () => {
	describe( 'Deterministic behavior', () => {
		it( 'should return the same hash for the same input', () => {
			// Arrange
			const input = 'test-string-123';

			// Act
			const hash1 = hashString( input );
			const hash2 = hashString( input );

			// Assert
			expect( hash1 ).toBe( hash2 );
		} );

		it( 'should return the same hash for the same input when passing a length parameter', () => {
			// Arrange
			const input = 'test-string-123';
			const length = 6;

			// Act
			const hash1 = hashString( input, length );
			const hash2 = hashString( input, length );

			// Assert
			expect( hash1 ).toBe( hash2 );
		} );
	} );

	describe( 'Uniqueness', () => {
		it( 'should return different hashes for different inputs', () => {
			// Arrange
			const input1 = 'hello';
			const input2 = 'world';

			// Act
			const hash1 = hashString( input1 );
			const hash2 = hashString( input2 );

			// Assert
			expect( hash1 ).not.toBe( hash2 );
		} );

		it( 'should return different hashes for similar inputs', () => {
			// Arrange
			const input1 = 'test-string-123-123';
			const input2 = 'test-string-124-123';

			// Act
			const hash1 = hashString( input1 );
			const hash2 = hashString( input2 );

			// Assert
			expect( hash1 ).not.toBe( hash2 );
		} );
	} );

	it.each( [ 'test', 'hello-world', '12345', 'abc-xyz-123' ] )(
		'result should contain only lowercase letters and numbers',
		( input ) => {
			// Act
			const result = hashString( input );

			// Assert
			expect( result ).toMatch( LOWERCASE_ALPHANUMERIC_REGEX );
		}
	);

	it( 'should return a string with the maximum length of length parameter', () => {
		// Arrange
		const input = 'test-string-123';
		const length = 5;

		// Act
		const result = hashString( input, length );

		// Assert
		expect( result ).toHaveLength( 5 );
	} );

	describe( 'Edge cases', () => {
		it( 'should handle empty string', () => {
			// Arrange
			const input = '';

			// Act
			const result = hashString( input );

			// Assert
			expect( result ).toBeTruthy();
			expect( typeof result ).toBe( 'string' );
		} );

		it( 'should handle very long strings', () => {
			// Arrange
			const input = 'a'.repeat( 10000 );

			// Act
			const result = hashString( input );

			// Assert
			expect( typeof result ).toBe( 'string' );
			expect( result ).toMatch( LOWERCASE_ALPHANUMERIC_REGEX );
		} );

		it( 'should handle special characters', () => {
			// Arrange
			const input = '!@#$%^&*()_+-=[]{}|;:,.<>?';

			// Act
			const result = hashString( input );

			// Assert
			expect( result ).toMatch( LOWERCASE_ALPHANUMERIC_REGEX );
		} );

		it( 'should handle unicode characters', () => {
			// Arrange
			const input = 'שלום עולם 你好 مرحبا';

			// Act
			const result = hashString( input );

			// Assert
			expect( result ).toMatch( LOWERCASE_ALPHANUMERIC_REGEX );
		} );

		it( 'should handle maxLength larger than hash length', () => {
			// Arrange
			const input = 'a';
			const maxLength = 20;

			// Act
			const result = hashString( input, maxLength );

			// Assert
			expect( result.length ).toBeLessThanOrEqual( maxLength );
		} );
	} );
} );
