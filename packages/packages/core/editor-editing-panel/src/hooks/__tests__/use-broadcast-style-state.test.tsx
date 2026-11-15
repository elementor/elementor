import { renderHook } from '@testing-library/react';

import { useElement } from '../../contexts/element-context';
import { STYLE_STATE_EVENT, useBroadcastStyleState } from '../use-broadcast-style-state';

jest.mock( '../../contexts/element-context' );

describe( 'useBroadcastStyleState', () => {
	const events: Array< { id: string; state: string | null } > = [];
	const listener = ( event: Event ) => events.push( ( event as CustomEvent ).detail );

	beforeEach( () => {
		events.length = 0;
		window.addEventListener( STYLE_STATE_EVENT, listener );
		jest.mocked( useElement ).mockReturnValue( {
			element: { id: 'item-1', type: 'e-menu-item' },
		} as unknown as ReturnType< typeof useElement > );
	} );

	afterEach( () => {
		window.removeEventListener( STYLE_STATE_EVENT, listener );
	} );

	it( 'should announce the active state of the selected element', () => {
		// Act
		renderHook( () => useBroadcastStyleState( 'e--current' ) );

		// Assert
		expect( events ).toEqual( [ { id: 'item-1', state: 'e--current' } ] );
	} );

	it( 'should announce a cleared state', () => {
		// Arrange
		const { rerender } = renderHook( ( { state } ) => useBroadcastStyleState( state ), {
			initialProps: { state: 'e--current' as 'e--current' | null },
		} );
		events.length = 0;

		// Act
		rerender( { state: null } );

		// Assert
		expect( events[ events.length - 1 ] ).toEqual( { id: 'item-1', state: null } );
	} );

	it( 'should clear the state when the panel is closed or the selection changes', () => {
		// Arrange
		const { unmount } = renderHook( () => useBroadcastStyleState( 'e--current' ) );
		events.length = 0;

		// Act
		unmount();

		// Assert
		expect( events ).toEqual( [ { id: 'item-1', state: null } ] );
	} );
} );
