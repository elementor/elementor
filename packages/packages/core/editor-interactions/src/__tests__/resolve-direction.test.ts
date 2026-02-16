import { resolveDirection } from '../utils/resolve-direction';

describe( 'resolveDirection', () => {
	describe( 'when effect changes to slide without a new direction', () => {
		it( 'should default to top when current direction is empty', () => {
			expect( resolveDirection( false, 'slide', undefined, '', 'fade' ) ).toBe( 'top' );
		} );

		it( 'should default to top even when current direction exists', () => {
			expect( resolveDirection( false, 'slide', undefined, 'left', 'fade' ) ).toBe( 'top' );
		} );

		it( 'should default to top when current direction is undefined', () => {
			expect( resolveDirection( false, 'slide', undefined, undefined, 'fade' ) ).toBe( 'top' );
		} );

		it( 'should default to top when new direction is an empty string', () => {
			expect( resolveDirection( true, 'slide', '', 'left', 'fade' ) ).toBe( 'top' );
		} );
	} );

	describe( 'when effect changes to slide with a new direction', () => {
		it( 'should use the provided new direction', () => {
			expect( resolveDirection( true, 'slide', 'bottom', '', 'fade' ) ).toBe( 'bottom' );
		} );

		it( 'should use the provided new direction over current direction', () => {
			expect( resolveDirection( true, 'slide', 'right', 'left', 'fade' ) ).toBe( 'right' );
		} );
	} );

	describe( 'when current effect is slide and direction is explicitly updated', () => {
		it( 'should use the new direction', () => {
			expect( resolveDirection( true, undefined, 'bottom', 'top', 'slide' ) ).toBe( 'bottom' );
		} );

		it( 'should default to top when new direction is undefined', () => {
			expect( resolveDirection( true, undefined, undefined, 'left', 'slide' ) ).toBe( 'top' );
		} );

		it( 'should use new direction when also changing effect away from slide', () => {
			expect( resolveDirection( true, 'fade', 'left', 'top', 'slide' ) ).toBe( 'left' );
		} );
	} );

	describe( 'when effect changes to a non-slide effect without direction in updates', () => {
		it( 'should preserve current direction when changing to fade', () => {
			expect( resolveDirection( false, 'fade', undefined, 'left', 'slide' ) ).toBe( 'left' );
		} );

		it( 'should preserve current direction when changing to scale', () => {
			expect( resolveDirection( false, 'scale', undefined, 'bottom', 'slide' ) ).toBe( 'bottom' );
		} );

		it( 'should return empty string when current direction is empty', () => {
			expect( resolveDirection( false, 'fade', undefined, '', 'slide' ) ).toBe( '' );
		} );

		it( 'should return undefined when current direction is undefined', () => {
			expect( resolveDirection( false, 'fade', undefined, undefined, 'slide' ) ).toBeUndefined();
		} );
	} );

	describe( 'when direction is explicitly provided for a non-slide effect', () => {
		it( 'should use the new direction', () => {
			expect( resolveDirection( true, 'fade', 'bottom', 'left', 'fade' ) ).toBe( 'bottom' );
		} );

		it( 'should allow setting direction to undefined', () => {
			expect( resolveDirection( true, undefined, undefined, 'left', 'fade' ) ).toBeUndefined();
		} );

		it( 'should allow setting direction to empty string', () => {
			expect( resolveDirection( true, undefined, '', 'left', 'fade' ) ).toBe( '' );
		} );
	} );

	describe( 'when no direction-related fields change', () => {
		it( 'should preserve current direction when updating unrelated fields', () => {
			expect( resolveDirection( false, undefined, undefined, 'top', 'slide' ) ).toBe( 'top' );
		} );

		it( 'should preserve current direction as right', () => {
			expect( resolveDirection( false, undefined, undefined, 'right', 'fade' ) ).toBe( 'right' );
		} );

		it( 'should preserve empty direction', () => {
			expect( resolveDirection( false, undefined, undefined, '', 'fade' ) ).toBe( '' );
		} );
	} );
} );
