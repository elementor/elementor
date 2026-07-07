import {
	shouldUseSmallerOutlineOffset,
	THIN_ELEMENT_MAX_HEIGHT_PX,
} from '../outline-offset-utils';

describe( 'shouldUseSmallerOutlineOffset', () => {
	it( 'returns true for thin elements like dividers', () => {
		// Arrange.
		const element = document.createElement( 'hr' );
		Object.defineProperty( element, 'offsetHeight', { value: THIN_ELEMENT_MAX_HEIGHT_PX } );

		// Act.
		const result = shouldUseSmallerOutlineOffset( element );

		// Assert.
		expect( result ).toBe( true );
	} );

	it( 'returns true for atomic form input widgets', () => {
		// Arrange.
		const element = document.createElement( 'input' );
		Object.defineProperty( element, 'offsetHeight', { value: 36 } );

		// Act.
		const result = shouldUseSmallerOutlineOffset( element, 'e-form-input' );

		// Assert.
		expect( result ).toBe( true );
	} );

	it( 'returns false for other atomic widgets', () => {
		// Arrange.
		const element = document.createElement( 'div' );
		Object.defineProperty( element, 'offsetHeight', { value: 100 } );

		// Act.
		const result = shouldUseSmallerOutlineOffset( element, 'e-heading' );

		// Assert.
		expect( result ).toBe( false );
	} );
} );
