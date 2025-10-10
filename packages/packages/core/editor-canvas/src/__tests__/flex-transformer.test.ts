import { flexTransformer } from '../transformers/styles/flex-transformer';

type Flex = {
	flexGrow?: number | null;
	flexShrink?: number | null;
	flexBasis?: { size: number; unit: string } | string | null;
};

describe( 'flexTransformer', () => {
	describe( 'when no values are provided', () => {
		it( 'should return null when all values are null', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: null,
				flexShrink: null,
				flexBasis: null,
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBeNull();
		} );

		it( 'should return null when all values are undefined', () => {
			// Arrange.
			const value: Flex = {};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBeNull();
		} );
	} );

	describe( 'when all three values are provided', () => {
		it( 'should return "grow shrink basis" when all values are set', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 2,
				flexShrink: 1,
				flexBasis: { size: 100, unit: 'px' },
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '2 1 100px' );
		} );

		it( 'should handle string basis value', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 1,
				flexShrink: 0,
				flexBasis: 'auto',
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '1 0 auto' );
		} );
	} );

	describe( 'when only two values are provided', () => {
		it( 'should return "grow shrink" when grow and shrink are set', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 1,
				flexShrink: 2,
				flexBasis: null,
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '1 2' );
		} );

		it( 'should return "grow 1 basis" when grow and basis are set', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 3,
				flexShrink: null,
				flexBasis: { size: 50, unit: '%' },
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '3 1 50%' );
		} );

		it( 'should return "0 shrink basis" when shrink and basis are set', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: null,
				flexShrink: 1,
				flexBasis: { size: 200, unit: 'px' },
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '0 1 200px' );
		} );
	} );

	describe( 'when only one value is provided', () => {
		it( 'should return "grow" when only grow is set', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 1,
				flexShrink: null,
				flexBasis: null,
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '1' );
		} );

		it( 'should return "0 shrink" when only shrink is set', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: null,
				flexShrink: 2,
				flexBasis: null,
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '0 2' );
		} );

		it( 'should return "0 1 basis" when only basis is set', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: null,
				flexShrink: null,
				flexBasis: { size: 300, unit: 'px' },
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '0 1 300px' );
		} );

		it( 'should handle string basis when only basis is set', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: null,
				flexShrink: null,
				flexBasis: 'content',
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '0 1 content' );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle zero values correctly', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 0,
				flexShrink: 0,
				flexBasis: { size: 0, unit: 'px' },
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '0 0 0px' );
		} );

		it( 'should handle basis with empty unit', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 1,
				flexShrink: 1,
				flexBasis: { size: 100, unit: '' },
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '1 1 100' );
		} );

		it( 'should handle basis with undefined unit', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 1,
				flexShrink: 1,
				flexBasis: { size: 100, unit: '' },
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '1 1 100' );
		} );

		it( 'should handle basis object without size property', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 1,
				flexShrink: 1,
				flexBasis: { unit: 'px' } as { size: number; unit: string },
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '1 1 [object Object]' );
		} );
	} );

	describe( 'CSS shorthand behavior', () => {
		it( 'should follow CSS flex shorthand rules for single value', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 2,
				flexShrink: null,
				flexBasis: null,
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '2' );
		} );

		it( 'should follow CSS flex shorthand rules for two values', () => {
			// Arrange.
			const value: Flex = {
				flexGrow: 1,
				flexShrink: 2,
				flexBasis: null,
			};

			// Act.
			const result = flexTransformer( value, { key: 'flex' } );

			// Assert.
			expect( result ).toBe( '1 2' );
		} );
	} );
} );
