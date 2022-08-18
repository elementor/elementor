import Arr from 'elementor-utils/arr';

describe( 'Arr', () => {
	it( 'join() -- Should join an array with a single glue', () => {
		// Arrange.
		const array = [ 'a', 'b', 'c' ];

		// Act.
		const result = Arr.join( array, '-' );

		// Assert.
		expect( result ).toBe( 'a-b-c' );
	} );

	it( 'join() -- Should return an empty string for empty array', () => {
		// Arrange.
		const array = [];

		// Act.
		const result = Arr.join( array, '-' );

		// Assert.
		expect( result ).toBe( '' );
	} );

	it( 'join() -- Should return the first item for a single-item array', () => {
		// Arrange.
		const array = [ 'a' ];

		// Act.
		const result = Arr.join( array, '-' );

		// Assert.
		expect( result ).toBe( 'a' );
	} );

	it( 'join() -- Should join an array with single and final glues', () => {
		// Arrange.
		const array = [ 'a', 'b', 'c' ];

		// Act.
		const result = Arr.join( array, ', ', ' and ' );

		// Assert.
		expect( result ).toBe( 'a, b and c' );
	} );
} );
