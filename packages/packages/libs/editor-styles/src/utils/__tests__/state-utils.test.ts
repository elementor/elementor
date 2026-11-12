import { getSelectorWithState, isClassState, isPseudoState } from '../state-utils';

describe( 'state-utils', () => {
	it( 'should treat the current state as a class state', () => {
		// Act & Assert
		expect( isClassState( 'e--current' ) ).toBe( true );
		expect( isPseudoState( 'e--current' as never ) ).toBe( false );
	} );

	it( 'should build a class selector for the current state', () => {
		// Act
		const selector = getSelectorWithState( '.menu-item', 'e--current' );

		// Assert
		expect( selector ).toBe( '.menu-item.e--current' );
	} );
} );
