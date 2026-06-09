import {
	formatFontFamilyForCss,
	getEnqueueFontFamily,
	normalizeFontFamilyValue,
} from '../font-family-value';

describe( 'font-family-value', () => {
	it( 'should return the trimmed stored value', () => {
		expect( normalizeFontFamilyValue( ' Open Sans ' ) ).toBe( 'Open Sans' );
	} );

	it( 'should return null for empty values', () => {
		expect( normalizeFontFamilyValue( '   ' ) ).toBeNull();
	} );

	it( 'should use the same normalization for css and enqueue', () => {
		const value = 'Open Sans';

		expect( formatFontFamilyForCss( value ) ).toBe( value );
		expect( getEnqueueFontFamily( value ) ).toBe( value );
	} );
} );
