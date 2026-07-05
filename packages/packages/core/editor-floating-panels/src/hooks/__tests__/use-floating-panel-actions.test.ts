import * as React from 'react';
import {
	__createStore,
	__deleteStore,
	__dispatch,
	__getState,
	__getStore,
	__registerSlice,
	__StoreProvider as StoreProvider,
} from '@elementor/store';
import { act, renderHook } from '@testing-library/react';

import { selectIsOpen, selectPanelState } from '../../store/selectors';
import { slice } from '../../store/slice';
import { type FloatingPanelDefaults } from '../../types';
import { useFloatingPanelActions } from '../use-floating-panel-actions';

const PANEL_ID = 'actions-panel';

const defaults: FloatingPanelDefaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
};

function renderActionsHook() {
	const store = __getStore();

	if ( ! store ) {
		throw new Error( 'Store is not initialized' );
	}

	const wrapper = ( { children }: { children: React.ReactNode } ) =>
		React.createElement( StoreProvider, { store }, children );

	return renderHook( () => useFloatingPanelActions( PANEL_ID ), { wrapper } );
}

describe( 'useFloatingPanelActions', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();
		__dispatch( slice.actions.register( { id: PANEL_ID, defaults } ) );
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'open dispatches open + bringToFront', () => {
		// Arrange.
		const { result } = renderActionsHook();

		// Act.
		act( () => result.current.open() );

		// Assert.
		expect( selectIsOpen( __getState(), PANEL_ID ) ).toBe( true );
		expect( selectPanelState( __getState(), PANEL_ID )?.zIndex ).toBe( 1 );
	} );

	it( 'toggle opens when closed and closes when open', () => {
		// Arrange.
		const { result } = renderActionsHook();

		// Assert — initial closed.
		expect( selectIsOpen( __getState(), PANEL_ID ) ).toBe( false );

		// Act — open via toggle.
		act( () => result.current.toggle() );

		// Assert.
		expect( selectIsOpen( __getState(), PANEL_ID ) ).toBe( true );
		expect( selectPanelState( __getState(), PANEL_ID )?.zIndex ).toBe( 1 );

		// Act — close via toggle.
		act( () => result.current.toggle() );

		// Assert.
		expect( selectIsOpen( __getState(), PANEL_ID ) ).toBe( false );
	} );

	it( 'focus dispatches bringToFront', () => {
		// Arrange.
		const { result } = renderActionsHook();

		// Act.
		act( () => result.current.focus() );

		// Assert.
		expect( selectPanelState( __getState(), PANEL_ID )?.zIndex ).toBe( 1 );
	} );
} );
