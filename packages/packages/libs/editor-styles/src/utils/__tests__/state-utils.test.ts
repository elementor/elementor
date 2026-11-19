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

	it.each( [ 'e--current-ancestor', 'e--expanded' ] as const )( 'should treat %s as a class state', ( state ) => {
		// Act & Assert
		expect( isClassState( state ) ).toBe( true );
		expect( isPseudoState( state as never ) ).toBe( false );
		expect( getSelectorWithState( '.menu-item', state ) ).toBe( `.menu-item.${ state }` );
	} );
} );
