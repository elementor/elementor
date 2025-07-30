import {
	__privateIsRouteActive as isRouteActive,
	__privateOpenRoute as openRoute,
	__privateRegisterRoute as registerRoute,
} from '@elementor/editor-v1-adapters';
import { __createStore, __dispatch, __getState, __registerSlice } from '@elementor/store';

import { selectOpenId, slice } from '../store';
import { sync } from '../sync';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRegisterRoute: jest.fn(),
	__privateOpenRoute: jest.fn(),
	__privateIsRouteActive: jest.fn(),
} ) );

describe( '@elementor/editor-panels sync', () => {
	const v1PanelElementsIds = [
		'elementor-panel-header-wrapper',
		'elementor-panel-content-wrapper',
		'elementor-panel-state-loading',
		'elementor-panel-footer',
	];

	beforeEach( () => {
		sync();
		__registerSlice( slice );
		__createStore();
	} );

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should register the empty route on init', () => {
		// Arrange & Act.
		window.dispatchEvent( new CustomEvent( 'elementor/panel/init' ) );

		// Assert.
		expect( registerRoute ).toHaveBeenCalledTimes( 1 );
		expect( registerRoute ).toHaveBeenCalledWith( 'panel/v2' );
	} );

	it( 'should open v1 route `panels/empty` when triggering `open` action', () => {
		// Arrange.
		window.dispatchEvent( new CustomEvent( 'elementor/panel/init' ) );

		// Act.
		__dispatch( slice.actions.open( 'test' ) );

		// Arrange.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/v2' );
	} );

	it( 'should close v1 route `panel/v2` when triggering `close` action and set default v1 route', () => {
		// Arrange.
		window.dispatchEvent( new CustomEvent( 'elementor/panel/init' ) );

		jest.mocked( isRouteActive ).mockImplementation( ( route ) => route === 'panel/v2' );

		__dispatch( slice.actions.open( 'not-relevant-test' ) );
		__dispatch( slice.actions.open( 'not-relevant-test-2' ) );
		__dispatch( slice.actions.open( 'test' ) );

		// Act.
		__dispatch( slice.actions.close( 'test' ) );

		// Arrange.
		expect( openRoute ).toHaveBeenCalledTimes( 2 );
		expect( openRoute ).toHaveBeenNthCalledWith( 1, 'panel/v2' );
		expect( openRoute ).toHaveBeenNthCalledWith( 2, 'panel/elements/categories' );
	} );

	it( 'should not navigate to v1 default route if the route is not `panel/v2`', () => {
		// Arrange.
		window.dispatchEvent( new CustomEvent( 'elementor/panel/init' ) );

		jest.mocked( isRouteActive ).mockImplementation( () => false );

		__dispatch( slice.actions.open( 'test' ) );

		// Act.
		__dispatch( slice.actions.close( 'test' ) );

		// Arrange.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/v2' );
	} );

	it( 'should close the panel when navigating to another v1 route', () => {
		// Arrange.
		__dispatch( slice.actions.open( 'test' ) );

		// Act.
		window.dispatchEvent(
			new CustomEvent( 'elementor/routes/close', {
				detail: { route: 'panel/v2' },
			} )
		);

		// Act.
		expect( selectOpenId( __getState() ) ).toBe( null );
	} );

	it( 'should hide old panel elements when navigating to empty route', () => {
		// Arrange.
		document.body.innerHTML = v1PanelElementsIds.map( ( id ) => `<div id="${ id }"></div>` ).join( '' );

		// Act.
		window.dispatchEvent(
			new CustomEvent( 'elementor/routes/open', {
				detail: { route: 'panel/v2' },
			} )
		);

		// Assert.
		v1PanelElementsIds.forEach( ( id ) => {
			expect( document.getElementById( id ) ).not.toBeVisible();
		} );
	} );

	it( 'should show old panel elements when navigating out of the empty route', () => {
		// Arrange.
		document.body.innerHTML = v1PanelElementsIds
			.map( ( id ) => `<div id="${ id }" inert="true" hidden="hidden"></div>` )
			.join( '' );

		// Act.
		window.dispatchEvent(
			new CustomEvent( 'elementor/routes/close', {
				detail: { route: 'panel/v2' },
			} )
		);

		// Assert.
		v1PanelElementsIds.forEach( ( id ) => {
			expect( document.getElementById( id ) ).toBeVisible();
		} );
	} );
} );
