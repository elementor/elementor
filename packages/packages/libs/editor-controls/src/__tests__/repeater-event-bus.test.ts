import { repeaterEventBus } from '../services/repeater-event-bus';

describe( 'RepeaterEventBus Singleton', () => {
	beforeEach( () => {
		repeaterEventBus.clearAll();
	} );

	it( 'should add a listener for an event', () => {
		// Arrange
		const eventName = 'test-event';
		const callback = jest.fn();

		// Act
		repeaterEventBus.subscribe( eventName, callback );

		// Assert
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should add multiple listeners for the same event', () => {
		// Arrange
		const eventName = 'test-event';
		const firstCallback = jest.fn();
		const secondCallback = jest.fn();

		// Act
		repeaterEventBus.subscribe( eventName, firstCallback );
		repeaterEventBus.subscribe( eventName, secondCallback );

		// Assert
		repeaterEventBus.emit( eventName );
		expect( firstCallback ).toHaveBeenCalledTimes( 1 );
		expect( secondCallback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should remove a specific listener for an event', () => {
		// Arrange
		const eventName = 'test-event';
		const callback = jest.fn();
		repeaterEventBus.subscribe( eventName, callback );

		// Act
		repeaterEventBus.unsubscribe( eventName, callback );

		// Assert
		repeaterEventBus.emit( eventName );
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should pass data to the listener when provided', () => {
		// Arrange
		const eventName = 'test-event';
		const callback = jest.fn();
		const testData = { itemValue: 'test-value' };
		repeaterEventBus.subscribe( eventName, callback );

		// Act
		repeaterEventBus.emit( eventName, testData );

		// Assert
		expect( callback ).toHaveBeenCalledWith( testData );
	} );

	it( 'should remove only the specified callback when unsubscribing', () => {
		// Arrange
		const eventName = 'test-event';
		const callback1 = jest.fn();
		const callback2 = jest.fn();
		repeaterEventBus.subscribe( eventName, callback1 );
		repeaterEventBus.subscribe( eventName, callback2 );

		// Act
		repeaterEventBus.unsubscribe( eventName, callback1 );

		// Assert
		repeaterEventBus.emit( eventName );
		expect( callback1 ).not.toHaveBeenCalled();
		expect( callback2 ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should remove all listeners when unsubscribing without callback', () => {
		// Arrange
		const eventName = 'test-event';
		const callback1 = jest.fn();
		const callback2 = jest.fn();
		repeaterEventBus.subscribe( eventName, callback1 );
		repeaterEventBus.subscribe( eventName, callback2 );

		// Act
		repeaterEventBus.unsubscribe( eventName );

		// Assert
		repeaterEventBus.emit( eventName );
		expect( callback1 ).not.toHaveBeenCalled();
		expect( callback2 ).not.toHaveBeenCalled();
	} );
} );
