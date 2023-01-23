import {
	commandEndEvent,
	commandStartEvent,
	dispatchReadyEvent,
	flushListeners,
	listenTo,
	windowEvent,
	v1ReadyEvent,
} from '../';

describe( '@elementor/v1-adapters/listeners', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		flushListeners();

		jest.useRealTimers();
	} );

	it( 'should listen to commands', () => {
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

	it( 'should listen to an array of events', () => {
		// Arrange.
		const command = 'test-command',
			event = 'test-event',
			callback = jest.fn();

		// Act.
		listenTo( [
			windowEvent( event ),
			commandStartEvent( command ),
		], callback );

		// Dispatch events.
		dispatchCommandBefore( command );
		dispatchCommandAfter( command );
		dispatchWindowEvent( event );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 2 );

		expect( callback ).toHaveBeenNthCalledWith( 1, {
			type: 'command',
			command: 'test-command',
			originalEvent: expect.any( CustomEvent ),
		} );

		expect( callback ).toHaveBeenNthCalledWith( 2, {
			type: 'window-event',
			event: 'test-event',
			originalEvent: expect.any( Event ),
		} );
	} );

	it( 'should flush listeners & re-listen', () => {
		// Arrange.
		const event1 = 'test-event-1',
			event2 = 'test-event-2',
			callback = jest.fn();

		listenTo(
			windowEvent( event1 ),
			callback,
		);

		// Act.
		flushListeners();

		// Dispatch events.
		dispatchWindowEvent( event1 );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 0 );

		// Act.
		listenTo(
			windowEvent( event2 ),
			callback,
		);

		// Dispatch events.
		dispatchWindowEvent( event2 );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should trigger v1 ready when v1 is loaded after v2', async () => {
		// Arrange.
		const callback = jest.fn();

		( window as any ).__elementorEditorV1LoadingPromise = new Promise( ( resolve ) => {
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

		// Cleanup.
		delete ( window as any ).__elementorEditorV1LoadingPromise;
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

function dispatchCommandBefore( command: string ) {
	window.dispatchEvent( new CustomEvent( 'elementor/commands/run/before', {
		detail: {
			command,
		},
	} ) );
}

function dispatchCommandAfter( command: string ) {
	window.dispatchEvent( new CustomEvent( 'elementor/commands/run/after', {
		detail: {
			command,
		},
	} ) );
}

function dispatchWindowEvent( event: string ) {
	window.dispatchEvent( new CustomEvent( event ) );
}
