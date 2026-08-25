import { fontFamilyPropTypeUtil } from '../font-family';

describe( 'fontFamilyPropTypeUtil.getEnqueueFontFamily', () => {
	it( 'returns a single family unchanged', () => {
		expect( fontFamilyPropTypeUtil.getEnqueueFontFamily( 'Inter' ) ).toBe( 'Inter' );
	} );

	it( 'trims surrounding whitespace', () => {
		expect( fontFamilyPropTypeUtil.getEnqueueFontFamily( '  Inter  ' ) ).toBe( 'Inter' );
	} );

	it( 'reduces a CSS fallback stack to the first family', () => {
		expect( fontFamilyPropTypeUtil.getEnqueueFontFamily( 'Inter, sans-serif' ) ).toBe( 'Inter' );
	} );

	it( 'strips double quotes from the first family', () => {
		expect( fontFamilyPropTypeUtil.getEnqueueFontFamily( '"Playfair Display", serif' ) ).toBe( 'Playfair Display' );
	} );

	it( 'strips single quotes from the first family', () => {
		expect( fontFamilyPropTypeUtil.getEnqueueFontFamily( "'Playfair Display', serif" ) ).toBe( 'Playfair Display' );
	} );

	it( 'returns empty string for CSS var() expressions', () => {
		expect( fontFamilyPropTypeUtil.getEnqueueFontFamily( 'var(--font-heading, Inter)' ) ).toBe( '' );
	} );

	it( 'returns empty string when normalization collapses the value', () => {
		expect( fontFamilyPropTypeUtil.getEnqueueFontFamily( ', sans-serif' ) ).toBe( '' );
	} );
} );
