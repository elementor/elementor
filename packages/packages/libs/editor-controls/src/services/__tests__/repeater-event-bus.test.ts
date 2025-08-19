import { type ExtendedWindow } from '@elementor/editor-elements';

import { RepeaterEventBus } from '../repeater-event-bus';

jest.mock( '@elementor/editor-elements', () => ( {
	getSelectedElements: jest.fn( () => [ { type: 'test-widget' } ] ),
} ) );

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
			const unsubscribe = eventBus.subscribe( 'test-event', callback );

			eventBus.emit( 'test-event' );

			expect( callback ).toHaveBeenCalledTimes( 1 );

			unsubscribe();
		} );

		it( 'should allow multiple subscribers for the same event', () => {
			const callback1 = jest.fn();
			const callback2 = jest.fn();

			eventBus.subscribe( 'test-event', callback1 );
			eventBus.subscribe( 'test-event', callback2 );

			eventBus.emit( 'test-event' );

			expect( callback1 ).toHaveBeenCalledTimes( 1 );
			expect( callback2 ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should properly unsubscribe callbacks', () => {
			const callback = jest.fn();
			const unsubscribe = eventBus.subscribe( 'test-event', callback );

			eventBus.emit( 'test-event' );
			expect( callback ).toHaveBeenCalledTimes( 1 );

			unsubscribe();
			eventBus.emit( 'test-event' );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should pass data to callbacks when provided', () => {
			const callback = jest.fn();
			const testData = { transition_type: 'fade', repeaterType: 'transition' };

			eventBus.subscribe( 'test-event', callback );
			eventBus.emit( 'test-event', testData );

			expect( callback ).toHaveBeenCalledWith( testData );
		} );
	} );

	describe( 'Transition Analytics Tracking', () => {
		it( 'should track transition item added events with analytics', () => {
			const transitionData = { transition_type: 'fade' };

			eventBus.emit( 'transition-item-added', transitionData );

			expect( mockDispatchEvent ).toHaveBeenCalledWith( 'test-transition-event', {
				location: 'style-tab-v4',
				secondaryLocation: 'transition-control',
				trigger: 'click',
				transition_type: 'fade',
				widget_type: 'test-widget',
			} );
		} );

		it( 'should use default transition type when not provided', () => {
			eventBus.emit( 'transition-item-added' );

			expect( mockDispatchEvent ).toHaveBeenCalledWith( 'test-transition-event', {
				location: 'style-tab-v4',
				secondaryLocation: 'transition-control',
				trigger: 'click',
				transition_type: 'unknown',
				widget_type: 'test-widget',
			} );
		} );
	} );
} );
