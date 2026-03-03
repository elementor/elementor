import { eventBus } from '../services/event-bus';

describe( 'eventBus Singleton', () => {
	beforeEach( () => {
		eventBus.clearAll();
	} );

	it( 'should add a listener for an event', () => {
		// Arrange
		const eventName = 'test-event';
		const callback = jest.fn();

		// Act
		eventBus.subscribe( eventName, callback );

		// Assert
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should add multiple listeners for the same event', () => {
		// Arrange
		const eventName = 'test-event';
		const firstCallback = jest.fn();
		const secondCallback = jest.fn();

		// Act
		eventBus.subscribe( eventName, firstCallback );
		eventBus.subscribe( eventName, secondCallback );

		// Assert
		eventBus.emit( eventName );
		expect( firstCallback ).toHaveBeenCalledTimes( 1 );
		expect( secondCallback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should remove a specific listener for an event', () => {
		// Arrange
		const eventName = 'test-event';
		const callback = jest.fn();
		eventBus.subscribe( eventName, callback );

		// Act
		eventBus.unsubscribe( eventName, callback );

		// Assert
		eventBus.emit( eventName );
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should pass data to the listener when provided', () => {
		// Arrange
		const eventName = 'test-event';
		const callback = jest.fn();
		const testData = { itemValue: 'test-value' };
		eventBus.subscribe( eventName, callback );

		// Act
		eventBus.emit( eventName, testData );

		// Assert
		expect( callback ).toHaveBeenCalledWith( testData );
	} );

	it( 'should remove only the specified callback when unsubscribing', () => {
		// Arrange
		const eventName = 'test-event';
		const callback1 = jest.fn();
		const callback2 = jest.fn();
		eventBus.subscribe( eventName, callback1 );
		eventBus.subscribe( eventName, callback2 );

		// Act
		eventBus.unsubscribe( eventName, callback1 );

		// Assert
		eventBus.emit( eventName );
		expect( callback1 ).not.toHaveBeenCalled();
		expect( callback2 ).toHaveBeenCalledTimes( 1 );
	} );
} );
