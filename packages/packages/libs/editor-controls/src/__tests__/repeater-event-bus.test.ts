import { RepeaterEventBus, repeaterEventBus } from '../services/repeater-event-bus';

describe( 'RepeaterEventBus', () => {
	let eventBus: RepeaterEventBus;

	beforeEach( () => {
		eventBus = new RepeaterEventBus();
	} );

	it( 'should add a listener for an event', () => {
		// Arrange.
		const eventName = 'test-event';
		const callback = jest.fn();

		// Act.
		eventBus.subscribe( eventName, callback );

		// Assert.
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should not add duplicate listeners for the same event', () => {
		// Arrange.
		const eventName = 'test-event';
		const firstCallback = jest.fn();
		const secondCallback = jest.fn();

		// Act.
		eventBus.subscribe( eventName, firstCallback );
		eventBus.subscribe( eventName, secondCallback );

		// Assert.
		eventBus.emit( eventName );
		expect( firstCallback ).toHaveBeenCalledTimes( 1 );
		expect( secondCallback ).not.toHaveBeenCalled();
	} );

	it( 'should remove a listener for an event', () => {
		// Arrange.
		const eventName = 'test-event';
		const callback = jest.fn();
		eventBus.subscribe( eventName, callback );

		// Act.
		eventBus.unsubscribe( eventName );

		// Assert.
		eventBus.emit( eventName );
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should call the listener when emitting an event', () => {
		// Arrange.
		const eventName = 'test-event';
		const callback = jest.fn();
		eventBus.subscribe( eventName, callback );

		// Act.
		eventBus.emit( eventName );

		// Assert.
		expect( callback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should pass data to the listener when provided', () => {
		// Arrange.
		const eventName = 'test-event';
		const callback = jest.fn();
		const testData = { itemValue: 'test-value' };
		eventBus.subscribe( eventName, callback );

		// Act.
		eventBus.emit( eventName, testData );

		// Assert.
		expect( callback ).toHaveBeenCalledWith( testData );
	} );
} );
