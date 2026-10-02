import { bindCssVars, toCssValue } from 'elementor/modules/data-flow/assets/js/actions/css-vars';
import { createScopedStore, createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';

describe( 'toCssValue', () => {
	it( 'should format numbers, booleans and safe strings', () => {
		// Act & Assert
		expect( toCssValue( 12.123456 ) ).toBe( '12.1235' );
		expect( toCssValue( true ) ).toBe( '1' );
		expect( toCssValue( '#ff00aa' ) ).toBe( '#ff00aa' );
		expect( toCssValue( 'rgba(0, 0, 0, 0.5)' ) ).toBe( 'rgba(0, 0, 0, 0.5)' );
	} );

	it( 'should reject values that could break out of a declaration', () => {
		// Act & Assert
		expect( toCssValue( 'red; background: url(x)' ) ).toBeNull();
		expect( toCssValue( '}' ) ).toBeNull();
		expect( toCssValue( { a: 1 } ) ).toBeNull();
		expect( toCssValue( NaN ) ).toBeNull();
	} );
} );

describe( 'bindCssVars', () => {
	it( 'should only write the keys the store owns', () => {
		// Arrange
		const page = createStore( { theme: 'dusk' } );
		const scope = createScopedStore( { tilt: 1 }, page );
		const element = document.createElement( 'div' );

		// Act
		bindCssVars( element, scope );
		page.setState( 'theme', 'mint' );
		scope.setState( 'tilt', 2 );

		// Assert
		expect( element.style.getPropertyValue( '--e-state-tilt' ) ).toBe( '2' );
		expect( element.style.getPropertyValue( '--e-state-theme' ) ).toBe( '' );
	} );
} );
