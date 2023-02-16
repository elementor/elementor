import {
	commandEndEvent,
	commandStartEvent,
	dispatchReadyEvent,
	listenTo,
	routeOpenEvent,
	routeCloseEvent,
	windowEvent,
	v1ReadyEvent,
	setReady,
	ExtendedWindow,
} from '../';

import {
	dispatchCommandAfter,
	dispatchCommandBefore,
	dispatchRouteClose,
	dispatchRouteOpen,
	dispatchWindowEvent,
} from '../../__tests__/utils';

describe( '@elementor/v1-adapters/listeners', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'should listen to command start', () => {
		// Arrange.
		const commandToListen = 'editor/documents/open',
			anotherCommand = 'non/related/command',
			callback = jest.fn();

		// Act.
		listenTo(
			commandStartEvent( commandToListen ),
			callback
		);

		// Dispatch the command to test.
		dispatchCommandBefore( commandToListen );
		dispatchCommandAfter( commandToListen );

		// Dispatch another command to make sure we don't listen to it.
		dispatchCommandBefore( anotherCommand );
		dispatchCommandAfter( anotherCommand );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			type: 'command',
			command: 'editor/documents/open',
			originalEvent: expect.any( CustomEvent ),
		} );
	} );

	it( 'should listen to command end', () => {
		// Arrange.
		const commandToListen = 'editor/documents/open',
			anotherCommand = 'non/related/command',
			callback = jest.fn();

		// Act.
		listenTo(
			commandEndEvent( commandToListen ),
			callback
		);

		// Dispatch the command to test.
		dispatchCommandBefore( commandToListen );
		dispatchCommandAfter( commandToListen );

		// Dispatch another command to make sure we don't listen to it.
		dispatchCommandBefore( anotherCommand );
		dispatchCommandAfter( anotherCommand );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			type: 'command',
			command: 'editor/documents/open',
			originalEvent: expect.any( CustomEvent ),
		} );
	} );

	it( 'should listen to route open', () => {
		// Arrange.
		const routeToListen = 'panel/menu',
			anotherRoute = 'non/related/route',
			callback = jest.fn();

		// Act.
		listenTo(
			routeOpenEvent( routeToListen ),
			callback
		);

		// Dispatch the route to test.
		dispatchRouteOpen( routeToListen );

		// Dispatch another route to make sure we don't listen to it.
		dispatchRouteOpen( anotherRoute );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			type: 'route',
			route: 'panel/menu',
			originalEvent: expect.any( CustomEvent ),
		} );
	} );

	it( 'should listen to route close', () => {
		// Arrange.
		const routeToListen = 'panel/menu',
			anotherRoute = 'non/related/route',
			callback = jest.fn();

		// Act.
		listenTo(
			routeCloseEvent( routeToListen ),
			callback
		);

		// Dispatch the route to test.
		dispatchRouteClose( routeToListen );

		// Dispatch another route to make sure we don't listen to it.
		dispatchRouteClose( anotherRoute );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			type: 'route',
			route: 'panel/menu',
			originalEvent: expect.any( CustomEvent ),
		} );
	} );

	it( 'should listen to window events', () => {
		// Arrange.
		const event = 'test-event',
			callback = jest.fn();

		// Act.
		listenTo(
			windowEvent( event ),
			callback
		);

		// Dispatch events.
		dispatchWindowEvent( event );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( callback ).toHaveBeenCalledWith( {
			type: 'window-event',
			event: 'test-event',
			originalEvent: expect.any( Event ),
		} );
	} );

	it( 'should listen to the same event with multiple callbacks', () => {
		// Arrange.
		const event = 'test-event',
			callback1 = jest.fn(),
			callback2 = jest.fn();

		// Act.
		listenTo(
			windowEvent( event ),
			callback1
		);

		listenTo(
			windowEvent( event ),
			callback2
		);

		// Dispatch events.
		dispatchWindowEvent( event );

		// Assert.
		expect( callback1 ).toHaveBeenCalledTimes( 1 );
		expect( callback2 ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should listen to an array of events', () => {
		// Arrange.
		const command = 'test-command',
			route = 'test-route',
			event = 'test-event',
			callback = jest.fn();

		// Act.
		listenTo( [
			windowEvent( event ),
			commandStartEvent( command ),
			routeOpenEvent( route ),
		], callback );

		// Dispatch events.
		dispatchCommandBefore( command );
		dispatchCommandAfter( command );

		dispatchRouteOpen( route );
		dispatchRouteClose( route );

		dispatchWindowEvent( event );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 3 );

		expect( callback ).toHaveBeenNthCalledWith( 1, {
			type: 'command',
			command: 'test-command',
			originalEvent: expect.any( CustomEvent ),
		} );

		expect( callback ).toHaveBeenNthCalledWith( 2, {
			type: 'route',
			route: 'test-route',
			originalEvent: expect.any( CustomEvent ),
		} );

		expect( callback ).toHaveBeenNthCalledWith( 3, {
			type: 'window-event',
			event: 'test-event',
			originalEvent: expect.any( Event ),
		} );
	} );

	it( 'should cleanup listeners', () => {
		// Arrange.
		const event1 = 'test-event-1',
			event2 = 'test-event-2',
			callback1 = jest.fn(),
			callback2 = jest.fn();

		const cleanup1 = listenTo(
			[
				windowEvent( event1 ),
				windowEvent( event2 ),
			],
			callback1,
		);

		const cleanup2 = listenTo(
			windowEvent( event1 ),
			callback2,
		);

		// Act.
		cleanup1();
		cleanup2();

		// Dispatch events.
		dispatchWindowEvent( event1 );
		dispatchWindowEvent( event2 );

		// Assert.
		expect( callback1 ).toHaveBeenCalledTimes( 0 );
		expect( callback2 ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'should not fail when calling the same cleanup twice', () => {
		// Arrange.
		const event = 'test-event',
			callback = jest.fn();

		const cleanup = listenTo(
			windowEvent( event ),
			callback,
		);

		// Act.
		cleanup();
		cleanup();

		// Dispatch events.
		dispatchWindowEvent( event );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'should trigger v1 ready when v1 is loaded after v2', async () => {
		// Arrange.
		const callback = jest.fn();
		const extendedWindow = ( window as unknown as ExtendedWindow );

		extendedWindow.__elementorEditorV1LoadingPromise = new Promise( ( resolve ) => {
			setTimeout( resolve, 1000 );
		} );

		// Act.
		listenTo(
			v1ReadyEvent(),
			callback
		);

		dispatchReadyEvent();

		await jest.runAllTimers();

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not trigger callback when the application is not ready', () => {
		// Arrange
		setReady( false );

		const event = 'test-event';
		const callback = jest.fn();

		// Act.
		listenTo(
			windowEvent( event ),
			callback
		);

		// Dispatch events.
		dispatchWindowEvent( event );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should throw when v1 is not loaded', async () => {
		// Act & Assert.
		try {
			await dispatchReadyEvent();
		} catch ( e ) {
			expect( e ).toBe( 'Elementor Editor V1 is not loaded' );
		}

		expect.assertions( 1 );
	} );
} );
