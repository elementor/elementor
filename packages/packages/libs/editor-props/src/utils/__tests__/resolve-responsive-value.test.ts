import { responsivePropTypeUtil } from '../../prop-types/responsive';
import { resolveResponsiveValue, responsiveFallbackChain } from '../resolve-responsive-value';

describe( 'responsivePropTypeUtil', () => {
	it( 'creates, extracts and validates a sparse breakpoint map', () => {
		const value = responsivePropTypeUtil.create( {
			desktop: { $$type: 'number', value: 3 },
			tablet: { $$type: 'number', value: 2 },
		} );

		expect( responsivePropTypeUtil.isValid( value ) ).toBe( true );
		expect( responsivePropTypeUtil.extract( value ) ).toEqual( {
			desktop: { $$type: 'number', value: 3 },
			tablet: { $$type: 'number', value: 2 },
		} );
	} );
} );

describe( 'resolveResponsiveValue', () => {
	const value = {
		desktop: 3,
		tablet: 2,
	};

	it( 'returns the authored breakpoint when present', () => {
		expect( resolveResponsiveValue( value, 'tablet' ) ).toBe( 2 );
	} );

	it( 'inherits from the next wider breakpoint', () => {
		expect( resolveResponsiveValue( value, 'mobile' ) ).toBe( 2 );
	} );

	it( 'skips a disabled breakpoint while cascading', () => {
		expect(
			resolveResponsiveValue( { desktop: 3, laptop: 5, tablet: 2 }, 'tablet', [ 'desktop', 'tablet' ] )
		).toBe( 2 );
		expect( resolveResponsiveValue( { desktop: 3, laptop: 5 }, 'tablet', [ 'desktop', 'tablet' ] ) ).toBe( 3 );
	} );

	it( 'unwraps transformable nested values', () => {
		expect(
			resolveResponsiveValue(
				{
					desktop: { $$type: 'number', value: 3 },
					tablet: { $$type: 'number', value: 2 },
				},
				'mobile'
			)
		).toBe( 2 );
	} );

	it( 'builds a fallback chain that ends at desktop', () => {
		expect( responsiveFallbackChain( 'tablet' ) ).toEqual( [ 'tablet', 'tablet_extra', 'laptop', 'desktop' ] );
		expect( responsiveFallbackChain( 'widescreen' ) ).toEqual( [ 'widescreen', 'desktop' ] );
	} );
} );
