import { type ExtendedWindow } from '@elementor/editor-elements';

import { RepeaterEventBus, type RepeaterEventType } from '../repeater-event-bus';

jest.mock( '@elementor/editor-elements', () => ( {
	getSelectedElements: jest.fn( () => [ { type: 'test-widget' } ] ),
} ) );

const testEvent = 'test-event' as RepeaterEventType;

describe( 'RepeaterEventBus', () => {
	let eventBus: RepeaterEventBus;
	let mockDispatchEvent: jest.Mock;

	const createMockConfig = () => ( {
		eventsManager: {
			dispatchEvent: mockDispatchEvent,
			config: {
				names: {
					elementorEditor: {
						transitions: {
							clickAddedTransition: 'test-transition-event',
						},
					},
				},
				locations: {
					styleTabV4: 'style-tab-v4',
				},
				secondaryLocations: {
					transitionControl: 'transition-control',
				},
				triggers: {
					click: 'click',
				},
			},
		},
	} );

	beforeEach( () => {
		eventBus = new RepeaterEventBus();
		mockDispatchEvent = jest.fn();
		( window as ExtendedWindow ).elementorCommon = createMockConfig();
	} );

	afterEach( () => {
		delete ( window as ExtendedWindow ).elementorCommon;
	} );

	describe( 'Event Subscription', () => {
		it( 'should subscribe to events and call callbacks', () => {
			const callback = jest.fn();
			const unsubscribe = eventBus.subscribe( testEvent, callback );

			eventBus.emit( testEvent );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			unsubscribe();
		} );

		it( 'should allow multiple subscribers for the same event', () => {
			const callback1 = jest.fn();
			const callback2 = jest.fn();

			eventBus.subscribe( testEvent, callback1 );
			eventBus.subscribe( testEvent, callback2 );

			eventBus.emit( testEvent );

			expect( callback1 ).toHaveBeenCalledTimes( 1 );
			expect( callback2 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should properly unsubscribe callbacks', () => {
			const callback = jest.fn();
			const unsubscribe = eventBus.subscribe( testEvent, callback );

			eventBus.emit( testEvent );
			expect( callback ).toHaveBeenCalledTimes( 1 );

			unsubscribe();
			eventBus.emit( testEvent );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
