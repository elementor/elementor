import { RepeaterEventBus, RepeaterEvents } from '../repeater-event-bus';

describe( 'RepeaterEventBus', () => {
	let eventBus: RepeaterEventBus;

	beforeEach( () => {
		eventBus = new RepeaterEventBus();
	} );

	describe( 'Event Subscription', () => {
		it( 'should subscribe to events and call callbacks', () => {
			const callback = jest.fn();
			const unsubscribe = eventBus.subscribe( RepeaterEvents.TransitionItemAdded, callback );

			eventBus.emit( RepeaterEvents.TransitionItemAdded );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			unsubscribe();
		} );

		it( 'should allow multiple subscribers for the same event', () => {
			const callback1 = jest.fn();
			const callback2 = jest.fn();

			eventBus.subscribe( RepeaterEvents.TransitionItemAdded, callback1 );
			eventBus.subscribe( RepeaterEvents.TransitionItemAdded, callback2 );

			eventBus.emit( RepeaterEvents.TransitionItemAdded );

			expect( callback1 ).toHaveBeenCalledTimes( 1 );
			expect( callback2 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should properly unsubscribe callbacks', () => {
			const callback = jest.fn();
			const unsubscribe = eventBus.subscribe( RepeaterEvents.TransitionItemAdded, callback );

			eventBus.emit( RepeaterEvents.TransitionItemAdded );
			expect( callback ).toHaveBeenCalledTimes( 1 );

			unsubscribe();
			eventBus.emit( RepeaterEvents.TransitionItemAdded );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should pass data to callbacks when emitting events', () => {
			const callback = jest.fn();
			const testData = { test: 'data' };

			eventBus.subscribe( RepeaterEvents.TransitionItemRemoved, callback );
			eventBus.emit( RepeaterEvents.TransitionItemRemoved, testData );

			expect( callback ).toHaveBeenCalledWith( testData );
		} );

		it( 'should handle multiple different event types', () => {
			const addedCallback = jest.fn();
			const removedCallback = jest.fn();

			eventBus.subscribe( RepeaterEvents.TransitionItemAdded, addedCallback );
			eventBus.subscribe( RepeaterEvents.TransitionItemRemoved, removedCallback );

			eventBus.emit( RepeaterEvents.TransitionItemAdded );
			eventBus.emit( RepeaterEvents.TransitionItemRemoved );

			expect( addedCallback ).toHaveBeenCalledTimes( 1 );
			expect( removedCallback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not call callbacks for unsubscribed events', () => {
			const callback = jest.fn();
			eventBus.subscribe( RepeaterEvents.TransitionItemAdded, callback );
			eventBus.unsubscribe( RepeaterEvents.TransitionItemAdded, callback );

			eventBus.emit( RepeaterEvents.TransitionItemAdded );

			expect( callback ).not.toHaveBeenCalled();
		} );
	} );
} );
