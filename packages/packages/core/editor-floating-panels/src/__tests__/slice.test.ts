import { __createStore, __deleteStore, __dispatch, __getState, __registerSlice } from '@elementor/store';

import {
	selectIsOpen,
	selectMinSize,
	selectPanelState,
	selectPosition,
	selectSize,
	selectTopZIndex,
} from '../store/selectors';
import { slice } from '../store/slice';
import { type FloatingPanelDefaults } from '../types';

const defaults: FloatingPanelDefaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
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
		expect( state ).toMatchObject( { isOpen: false } );
		expect( state?.size ).toEqual( { inlineSize: 320, blockSize: 480 } );
		expect( selectMinSize( __getState(), 'a' ) ).toEqual( { inlineSize: 240, blockSize: 320 } );
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

	it( 'register with persisted state restores that state and derives min size from defaults', () => {
		// Arrange.
		const persisted = {
			isOpen: true,
			position: { insetInlineStart: 500, insetBlockStart: 200 },
			size: { inlineSize: 400, blockSize: 500 },
			zIndex: 7,
		};

		// Act.
		__dispatch( slice.actions.register( { id: 'a', defaults, persisted } ) );

		// Assert.
		expect( selectPanelState( __getState(), 'a' ) ).toEqual( persisted );
		expect( selectMinSize( __getState(), 'a' ) ).toEqual( { inlineSize: 240, blockSize: 320 } );
		expect( selectTopZIndex( __getState() ) ).toBeGreaterThanOrEqual( 7 );
	} );

	it( 'updates size', () => {
		// Arrange.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );

		// Act.
		__dispatch( slice.actions.setSize( { id: 'a', size: { inlineSize: 600, blockSize: 700 } } ) );

		// Assert.
		expect( selectSize( __getState(), 'a' ) ).toEqual( { inlineSize: 600, blockSize: 700 } );
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

		if ( ! a || ! b ) {
			throw new Error( 'Expected both panels to be registered' );
		}

		expect( b.zIndex ).toBeGreaterThan( a.zIndex );
	} );
} );
