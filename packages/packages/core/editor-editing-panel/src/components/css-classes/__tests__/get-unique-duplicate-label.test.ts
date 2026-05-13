import { getUniqueDuplicateLabel } from '../duplicate-class-menu-item';

describe( 'getUniqueDuplicateLabel', () => {
	it( 'should return copy-of-{label} when no conflict exists', () => {
		// Arrange.
		const existingLabels = [ 'my-class', 'other-class' ];

		// Act.
		const result = getUniqueDuplicateLabel( 'my-class', existingLabels );

		// Assert.
		expect( result ).toBe( 'copy-of-my-class' );
	} );

	it( 'should append a counter when copy-of-{label} already exists', () => {
		// Arrange.
		const existingLabels = [ 'my-class', 'copy-of-my-class' ];

		// Act.
		const result = getUniqueDuplicateLabel( 'my-class', existingLabels );

		// Assert.
		expect( result ).toBe( 'copy-of-my-class-2' );
	} );

	it( 'should increment the counter until a unique label is found', () => {
		// Arrange.
		const existingLabels = [ 'my-class', 'copy-of-my-class', 'copy-of-my-class-2', 'copy-of-my-class-3' ];

		// Act.
		const result = getUniqueDuplicateLabel( 'my-class', existingLabels );

		// Assert.
		expect( result ).toBe( 'copy-of-my-class-4' );
	} );
} );
