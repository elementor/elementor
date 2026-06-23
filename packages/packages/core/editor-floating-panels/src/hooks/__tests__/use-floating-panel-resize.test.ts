import * as React from 'react';
import { renderHookWithStore } from 'test-utils';
import {
	__createStore,
	__deleteStore,
	__dispatch,
	__getState,
	__getStore,
	__registerSlice,
} from '@elementor/store';
import { act } from '@testing-library/react';

import { selectPosition, selectSize } from '../../store/selectors';
import { slice } from '../../store/slice';
import { type FloatingPanelDefaults } from '../../types';
import { usePanelResizeInteraction } from '../use-floating-panel-resize';

const PANEL_ID = 'resize-panel';
const SIDE_PANEL_WIDTH_PX = 280;
const VIEWPORT_WIDTH_PX = 1200;
const VIEWPORT_HEIGHT_PX = 800;
const POINTER_ID = 1;

const defaults: FloatingPanelDefaults = {
	width: 320,
	height: 480,
	minWidth: 240,
	minHeight: 320,
};

const startPosition = { insetInlineStart: 400, insetBlockStart: 120 };
const startSize = { inlineSize: 320, blockSize: 480 };

function createPointerTarget() {
	const target = document.createElement( 'div' );
	target.setPointerCapture = jest.fn();

	return target;
}

function createPointerEvent(
	target: HTMLElement,
	overrides: Partial< { pointerId: number; clientX: number; clientY: number } > = {}
) {
	return {
		pointerId: POINTER_ID,
		clientX: 0,
		clientY: 0,
		currentTarget: target,
		...overrides,
	} as unknown as React.PointerEvent< HTMLElement >;
}

function setupViewport() {
	Object.defineProperty( window, 'innerWidth', { configurable: true, value: VIEWPORT_WIDTH_PX } );
	Object.defineProperty( window, 'innerHeight', { configurable: true, value: VIEWPORT_HEIGHT_PX } );

	const sidePanel = document.createElement( 'div' );
	sidePanel.id = 'elementor-panel';
	jest.spyOn( sidePanel, 'getBoundingClientRect' ).mockReturnValue( { width: SIDE_PANEL_WIDTH_PX } as DOMRect );
	document.body.appendChild( sidePanel );
}

describe( 'usePanelResizeInteraction', () => {
	beforeEach( () => {
		setupViewport();
		__registerSlice( slice );
		__createStore();
		__dispatch( slice.actions.register( { id: PANEL_ID, defaults } ) );
		__dispatch( slice.actions.open( PANEL_ID ) );
		__dispatch( slice.actions.setPosition( { id: PANEL_ID, position: startPosition } ) );
		__dispatch( slice.actions.setSize( { id: PANEL_ID, size: startSize } ) );
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		__deleteStore();
	} );

	it( 'updates panel size while resizing an inline-end edge', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => usePanelResizeInteraction( PANEL_ID ), store );
		const handleProps = result.current.getResizeHandleProps( 'inline-end' );

		// Act.
		act( () => {
			handleProps.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			handleProps.onPointerMove( createPointerEvent( target, { clientX: 50, clientY: 0 } ) );
		} );

		// Assert.
		expect( selectSize( __getState(), PANEL_ID ) ).toEqual( { inlineSize: 370, blockSize: 480 } );
		expect( selectPosition( __getState(), PANEL_ID ) ).toEqual( startPosition );
		expect( target.setPointerCapture ).toHaveBeenCalledWith( POINTER_ID );
	} );

	it( 'updates position and size while resizing an inline-start edge', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => usePanelResizeInteraction( PANEL_ID ), store );
		const handleProps = result.current.getResizeHandleProps( 'inline-start' );

		// Act.
		act( () => {
			handleProps.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			handleProps.onPointerMove( createPointerEvent( target, { clientX: -40, clientY: 0 } ) );
		} );

		// Assert.
		expect( selectPosition( __getState(), PANEL_ID ) ).toEqual( {
			insetInlineStart: 360,
			insetBlockStart: 120,
		} );
		expect( selectSize( __getState(), PANEL_ID ) ).toEqual( { inlineSize: 360, blockSize: 480 } );
	} );

	it( 'updates panel size while resizing a block-end edge', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => usePanelResizeInteraction( PANEL_ID ), store );
		const handleProps = result.current.getResizeHandleProps( 'block-end' );

		// Act.
		act( () => {
			handleProps.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			handleProps.onPointerMove( createPointerEvent( target, { clientX: 0, clientY: 40 } ) );
		} );

		// Assert.
		expect( selectSize( __getState(), PANEL_ID ) ).toEqual( { inlineSize: 320, blockSize: 520 } );
	} );

	it( 'ignores pointer down when the panel has no geometry', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => usePanelResizeInteraction( 'missing-panel' ), store );
		const handleProps = result.current.getResizeHandleProps( 'inline-end' );

		// Act.
		act( () => {
			handleProps.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			handleProps.onPointerMove( createPointerEvent( target, { clientX: 100, clientY: 0 } ) );
		} );

		// Assert.
		expect( target.setPointerCapture ).not.toHaveBeenCalled();
		expect( selectSize( __getState(), PANEL_ID ) ).toEqual( startSize );
	} );

	it( 'snapshots viewport bounds at pointer down', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const sidePanel = document.getElementById( 'elementor-panel' );

		if ( ! sidePanel ) {
			throw new Error( 'Side panel is not mounted' );
		}

		const getBoundingClientRect = jest.spyOn( sidePanel, 'getBoundingClientRect' );
		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => usePanelResizeInteraction( PANEL_ID ), store );
		const handleProps = result.current.getResizeHandleProps( 'inline-end' );

		// Act.
		act( () => {
			handleProps.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			getBoundingClientRect.mockClear();
			handleProps.onPointerMove( createPointerEvent( target, { clientX: 50, clientY: 0 } ) );
			handleProps.onPointerMove( createPointerEvent( target, { clientX: 100, clientY: 0 } ) );
		} );

		// Assert.
		expect( getBoundingClientRect ).not.toHaveBeenCalled();
	} );

	it( 'clears the resize session on pointer up', () => {
		// Arrange.
		const store = __getStore();

		if ( ! store ) {
			throw new Error( 'Store is not initialized' );
		}

		const target = createPointerTarget();
		const { result } = renderHookWithStore( () => usePanelResizeInteraction( PANEL_ID ), store );
		const handleProps = result.current.getResizeHandleProps( 'inline-end' );

		// Act.
		act( () => {
			handleProps.onPointerDown( createPointerEvent( target, { clientX: 0, clientY: 0 } ) );
			handleProps.onPointerUp( createPointerEvent( target ) );
			handleProps.onPointerMove( createPointerEvent( target, { clientX: 200, clientY: 0 } ) );
		} );

		// Assert.
		expect( selectSize( __getState(), PANEL_ID ) ).toEqual( startSize );
	} );
} );
