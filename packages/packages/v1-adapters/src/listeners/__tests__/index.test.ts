import {
	commandEnd,
	commandStart,
	flushListeners,
	startV1Listeners,
	listenTo,
	windowEvent,
	v1Ready,
} from '../';

describe( '@elementor/v1-adapters/listener', () => {
	beforeEach( () => {
		( window as any ).__elementorEditorV1Loaded = Promise.resolve();

		jest.useFakeTimers();
	} );

	afterEach( () => {
		flushListeners();

		jest.useRealTimers();

		delete ( window as any ).__elementorEditorV1Loaded;
	} );

	it( 'should listen to commands', () => {
		// Arrange.
		const commandToListen = 'editor/documents/open',
			anotherCommand = 'non/related/command',
			callback = jest.fn();

		// Act.
		listenTo(
			commandEnd( commandToListen ),
			callback
		);

		startV1Listeners();

		// Dispatch events.
		dispatchCommandBefore( commandToListen );
		dispatchCommandAfter( commandToListen );

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

		startV1Listeners();

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

	it( 'should accept an array of events', () => {
		// Arrange.
		const command = 'test-command',
			event = 'test-event',
			callback = jest.fn();

		// Act.
		listenTo( [
			windowEvent( event ),
			commandStart( command ),
		], callback );

		startV1Listeners();

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

		startV1Listeners();

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

		startV1Listeners();

		// Dispatch events.
		dispatchWindowEvent( event2 );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should trigger v1 init when v1 is loaded after v2', async () => {
		// Arrange.
		const callback = jest.fn();

		( window as any ).__elementorEditorV1Loaded = new Promise( ( resolve ) => {
			setTimeout( resolve, 1000 );
		} );

		// Act.
		listenTo(
			v1Ready(),
			callback
		);

		startV1Listeners();

		await waitForAllTicks();

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should throw when v1 is not loaded', async () => {
		// Arrange.
		const callback = jest.fn();

		delete ( window as any ).__elementorEditorV1Loaded;

		// Act.
		listenTo(
			v1Ready(),
			callback
		);

		// Assert.
		try {
			await startV1Listeners();
		} catch ( e ) {
			expect( e ).toBe( 'Elementor Editor V1 is not loaded' );
		}
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

function waitForAllTicks() {
	jest.runAllTimers();

	return Promise.resolve();
}
