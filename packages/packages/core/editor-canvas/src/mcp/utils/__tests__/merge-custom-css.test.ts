import { mergeCustomCssText, readStoredCustomCssText } from '../merge-custom-css';

describe( 'mergeCustomCssText', () => {
	it( 'merges explicit custom CSS with intention fallback CSS', () => {
		// Arrange
		const explicitCss = 'padding: 2rem;';
		const intentionCss = 'font-size: 1.5rem;';

		// Act
		const merged = mergeCustomCssText( explicitCss, intentionCss );

		// Assert
		expect( merged ).toBe( 'padding: 2rem;\nfont-size: 1.5rem;' );
	} );

	it( 'returns a single CSS block when only one part is provided', () => {
		// Act
		const merged = mergeCustomCssText( undefined, 'color: red;' );

		// Assert
		expect( merged ).toBe( 'color: red;' );
	} );
} );

describe( 'readStoredCustomCssText', () => {
	it( 'decodes stored custom CSS text', () => {
		// Arrange
		const cssText = 'display: flex;';

		// Act
		const decoded = readStoredCustomCssText( btoa( cssText ) );

		// Assert
		expect( decoded ).toBe( cssText );
	} );
} );
