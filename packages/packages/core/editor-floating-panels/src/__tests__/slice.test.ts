import { __createStore, __deleteStore, __dispatch, __getState, __registerSlice } from '@elementor/store';

import {
	selectCorner,
	selectIsDraggable,
	selectIsOpen,
	selectIsResizable,
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

const defaultPosition = {
	insetBlockStart: 80,
	insetBlockEnd: 0,
	insetInlineStart: 24,
	insetInlineEnd: 0,
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
		expect( state ).toMatchObject( {
			isOpen: false,
			corner: 'block-start-inline-start',
			position: defaultPosition,
		} );
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
				position: {
					insetBlockStart: 80,
					insetBlockEnd: 0,
					insetInlineStart: 200,
					insetInlineEnd: 0,
				},
			} )
		);

		// Assert.
		expect( selectPosition( __getState(), 'a' ) ).toEqual( {
			insetBlockStart: 80,
			insetBlockEnd: 0,
			insetInlineStart: 200,
			insetInlineEnd: 0,
		} );
	} );

	it( 'register with persisted state restores that state and derives min size from defaults', () => {
		// Arrange.
		const persisted = {
			isOpen: true,
			zIndex: 7,
			size: { inlineSize: 400, blockSize: 500 },
			corner: 'block-start-inline-start' as const,
			position: {
				insetBlockStart: 200,
				insetBlockEnd: 0,
				insetInlineStart: 500,
				insetInlineEnd: 0,
			},
		};

		// Act.
		__dispatch( slice.actions.register( { id: 'a', defaults, persisted } ) );

		// Assert.
		expect( selectPanelState( __getState(), 'a' ) ).toEqual( persisted );
		expect( selectMinSize( __getState(), 'a' ) ).toEqual( { inlineSize: 240, blockSize: 320 } );
		expect( selectTopZIndex( __getState() ) ).toBeGreaterThanOrEqual( 7 );
	} );

	it( 'discards persisted state when persisted corner differs from defaults corner', () => {
		// Arrange.
		const persisted = {
			isOpen: true,
			zIndex: 5,
			size: { inlineSize: 400, blockSize: 500 },
			corner: 'block-start-inline-start' as const,
			position: {
				insetBlockStart: 200,
				insetBlockEnd: 0,
				insetInlineStart: 500,
				insetInlineEnd: 0,
			},
		};

		// Act.
		__dispatch(
			slice.actions.register( {
				id: 'a',
				defaults: { ...defaults, corner: 'block-start-inline-end' },
				persisted,
			} )
		);

		// Assert.
		const state = selectPanelState( __getState(), 'a' );
		expect( state?.corner ).toBe( 'block-start-inline-end' );
		expect( state?.isOpen ).toBe( false );
		expect( state?.position ).toEqual( {
			insetBlockStart: 80,
			insetBlockEnd: 0,
			insetInlineStart: 0,
			insetInlineEnd: 24,
		} );
	} );

	it( 'registers block-end-inline-end corner with custom initialPosition', () => {
		// Act.
		__dispatch(
			slice.actions.register( {
				id: 'a',
				defaults: {
					...defaults,
					corner: 'block-end-inline-end',
					initialPosition: { insetInlineEnd: 100, insetBlockEnd: 50 },
				},
			} )
		);

		// Assert.
		expect( selectCorner( __getState(), 'a' ) ).toBe( 'block-end-inline-end' );
		expect( selectPosition( __getState(), 'a' ) ).toEqual( {
			insetBlockStart: 0,
			insetBlockEnd: 50,
			insetInlineStart: 0,
			insetInlineEnd: 100,
		} );
	} );

	it( 'updates size', () => {
		// Arrange.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );

		// Act.
		__dispatch( slice.actions.setSize( { id: 'a', size: { inlineSize: 600, blockSize: 700 } } ) );

		// Assert.
		expect( selectSize( __getState(), 'a' ) ).toEqual( { inlineSize: 600, blockSize: 700 } );
	} );

	it( 'stores isDraggable as false by default', () => {
		// Act.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );

		// Assert.
		expect( selectIsDraggable( __getState(), 'a' ) ).toBe( false );
	} );

	it( 'stores isDraggable as true when provided', () => {
		// Act.
		__dispatch( slice.actions.register( { id: 'a', defaults, isDraggable: true } ) );

		// Assert.
		expect( selectIsDraggable( __getState(), 'a' ) ).toBe( true );
	} );

	it( 'stores isResizable as false by default', () => {
		// Act.
		__dispatch( slice.actions.register( { id: 'a', defaults } ) );

		// Assert.
		expect( selectIsResizable( __getState(), 'a' ) ).toBe( false );
	} );

	it( 'stores isResizable as true when provided', () => {
		// Act.
		__dispatch( slice.actions.register( { id: 'a', defaults, isResizable: true } ) );

		// Assert.
		expect( selectIsResizable( __getState(), 'a' ) ).toBe( true );
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
