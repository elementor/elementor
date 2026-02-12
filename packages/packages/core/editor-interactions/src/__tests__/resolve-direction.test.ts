import { resolveDirection } from '../utils/resolve-direction';

describe( 'resolveDirection', () => {
	describe( 'when effect changes to slide without a new direction', () => {
		it( 'should default to top when current direction is empty', () => {
			const result = resolveDirection( false, 'slide', undefined, '' );

			expect( result ).toBe( 'top' );
		} );

		it( 'should default to top even when current direction exists', () => {
			const result = resolveDirection( false, 'slide', undefined, 'left' );

			expect( result ).toBe( 'top' );
		} );

		it( 'should default to top when current direction is undefined', () => {
			const result = resolveDirection( false, 'slide', undefined, undefined );

			expect( result ).toBe( 'top' );
		} );

		it( 'should default to top when new direction is an empty string', () => {
			const result = resolveDirection( true, 'slide', '', 'left' );

			expect( result ).toBe( 'top' );
		} );
	} );

	describe( 'when effect changes to slide with a new direction', () => {
		it( 'should use the provided new direction', () => {
			const result = resolveDirection( true, 'slide', 'bottom', '' );

			expect( result ).toBe( 'bottom' );
		} );

		it( 'should use the provided new direction over current direction', () => {
			const result = resolveDirection( true, 'slide', 'right', 'left' );

			expect( result ).toBe( 'right' );
		} );
	} );

	describe( 'when effect changes to a non-slide effect without direction in updates', () => {
		it( 'should preserve current direction when changing to fade', () => {
			const result = resolveDirection( false, 'fade', undefined, 'left' );

			expect( result ).toBe( 'left' );
		} );

		it( 'should preserve current direction when changing to scale', () => {
			const result = resolveDirection( false, 'scale', undefined, 'bottom' );

			expect( result ).toBe( 'bottom' );
		} );

		it( 'should return empty string when current direction is empty', () => {
			const result = resolveDirection( false, 'fade', undefined, '' );

			expect( result ).toBe( '' );
		} );

		it( 'should return undefined when current direction is undefined', () => {
			const result = resolveDirection( false, 'fade', undefined, undefined );

			expect( result ).toBeUndefined();
		} );
	} );

	describe( 'when direction is explicitly provided in updates (hasDirection=true)', () => {
		it( 'should use the new direction for non-slide effects', () => {
			const result = resolveDirection( true, 'fade', 'bottom', 'left' );

			expect( result ).toBe( 'bottom' );
		} );

		it( 'should allow setting direction to undefined', () => {
			const result = resolveDirection( true, 'fade', undefined, 'left' );

			expect( result ).toBeUndefined();
		} );

		it( 'should allow setting direction to empty string', () => {
			const result = resolveDirection( true, undefined, '', 'left' );

			expect( result ).toBe( '' );
		} );
	} );

	describe( 'when no direction-related fields change', () => {
		it( 'should preserve current direction when updating unrelated fields', () => {
			const result = resolveDirection( false, undefined, undefined, 'top' );

			expect( result ).toBe( 'top' );
		} );

		it( 'should preserve current direction as right', () => {
			const result = resolveDirection( false, undefined, undefined, 'right' );

			expect( result ).toBe( 'right' );
		} );

		it( 'should preserve empty direction', () => {
			const result = resolveDirection( false, undefined, undefined, '' );

			expect( result ).toBe( '' );
		} );
	} );

	describe( 'when current direction is "slide" (edge case)', () => {
		it( 'should use new direction when provided', () => {
			const result = resolveDirection( true, undefined, 'left', 'slide' );

			expect( result ).toBe( 'left' );
		} );

		it( 'should default to top when new direction is not provided', () => {
			const result = resolveDirection( true, undefined, undefined, 'slide' );

			expect( result ).toBe( 'top' );
		} );

		it( 'should preserve "slide" as current direction when hasDirection is false', () => {
			const result = resolveDirection( false, undefined, undefined, 'slide' );

			expect( result ).toBe( 'slide' );
		} );
	} );
} );
