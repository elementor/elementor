import { type MixpanelEvent, sendMixpanelEvent } from '../mixpanel-tracking';

type ExtendedWindow = Window & {
	elementorCommon?: {
		eventsManager?: {
			dispatchEvent: ( name: string, data: Record< string, unknown > ) => void;
		};
	};
};

describe( 'mixpanel-tracking', () => {
	// Arrange.
	const mockEvent: MixpanelEvent = {
		location: 'test-location',
		secondaryLocation: 'test-secondary',
		trigger: 'test-trigger',
		transition_type: 'test-transition',
		widget_type: 'test-widget',
		eventName: 'test-event',
	};

	const mockDispatchEvent = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		Object.defineProperty( window, 'elementorCommon', {
			value: {
				eventsManager: {
					dispatchEvent: mockDispatchEvent,
				},
			},
			writable: true,
		} );
	} );

	afterEach( () => {
		delete ( window as ExtendedWindow ).elementorCommon;
	} );

	it( 'should dispatch event when dispatchEvent is available', () => {
		// Act.
		sendMixpanelEvent( mockEvent );

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith( mockEvent.eventName, mockEvent );
	} );

	it( 'should not throw error when dispatchEvent is undefined', () => {
		// Arrange.
		delete ( window as ExtendedWindow ).elementorCommon;

		// Act & Assert.
		expect( () => sendMixpanelEvent( mockEvent ) ).not.toThrow();
	} );

	it( 'should call dispatchEvent with correct event data', () => {
		// Arrange.
		const customEvent: MixpanelEvent = {
			location: 'custom-location',
			secondaryLocation: 'custom-secondary',
			trigger: 'custom-trigger',
			transition_type: 'custom-transition',
			widget_type: 'custom-widget',
			eventName: 'custom-event',
		};

		// Act.
		sendMixpanelEvent( customEvent );

		// Assert.
		expect( mockDispatchEvent ).toHaveBeenCalledWith( customEvent.eventName, customEvent );
	} );
} );
