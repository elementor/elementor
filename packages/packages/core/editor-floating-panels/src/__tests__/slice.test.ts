import { __createStore, __deleteStore, __dispatch, __getState, __registerSlice } from '@elementor/store';

import {
	selectIsOpen,
	selectMode,
	selectPanelState,
	selectPosition,
	selectTopZIndex,
} from '../store/selectors';
import { slice } from '../store/slice';
import { type FloatingPanelDefaults } from '../types';

const defaults: FloatingPanelDefaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
	initialMode: 'docked',
};

describe( 'floating-panels slice', () => {
	beforeEach( () => {
		__registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		__deleteStore();
	} );

	it( 'registers a panel with its defaults', () => {
		// Act.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );

		// Assert.
		const state = selectPanelState( __getState(), 'a' );
		expect( state ).toMatchObject( { isOpen: false, mode: 'docked' } );
		expect( state?.size ).toEqual( { inlineSize: 320, blockSize: 480 } );
	} );

	it( 'opens and closes a panel', () => {
		// Arrange.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );

		// Act.
		__dispatch( slice.actions.open( 'a' ) );

		// Assert.
		expect( selectIsOpen( __getState(), 'a' ) ).toBe( true );

		// Act.
		__dispatch( slice.actions.close( 'a' ) );

		// Assert.
		expect( selectIsOpen( __getState(), 'a' ) ).toBe( false );
	} );

	it( 'switches dock mode', () => {
		// Arrange.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );

		// Act.
		__dispatch( slice.actions.setMode( { id: 'a', mode: 'floating' } ) );

		// Assert.
		expect( selectMode( __getState(), 'a' ) ).toBe( 'floating' );
	} );

	it( 'updates position', () => {
		// Arrange.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );

		// Act.
		__dispatch(
			slice.actions.setPosition( {
				id: 'a',
				position: { insetInlineStart: 200, insetBlockStart: 80 },
			} )
		);

		// Assert.
		expect( selectPosition( __getState(), 'a' ) ).toEqual( {
			insetInlineStart: 200,
			insetBlockStart: 80,
		} );
	} );

	it( 'bringToFront raises zIndex above all others', () => {
		// Arrange.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );
		__dispatch( slice.actions.register( { id: 'b', defaults } ) );

		// Act.
		__dispatch( slice.actions.bringToFront( 'a' ) );
		__dispatch( slice.actions.bringToFront( 'b' ) );

		// Assert.
		expect( selectTopZIndex( __getState() ) ).toBeGreaterThanOrEqual( 2 );
		const a = selectPanelState( __getState(), 'a' );
		const b = selectPanelState( __getState(), 'b' );
		expect( b!.zIndex ).toBeGreaterThan( a!.zIndex );
	} );
} );
