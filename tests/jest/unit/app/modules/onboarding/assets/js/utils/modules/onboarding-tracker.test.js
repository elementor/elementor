const mockDispatchEvent = jest.fn( () => true );

beforeEach( () => {
	sessionStorage.clear();
	localStorage.clear();
	mockDispatchEvent.mockClear();

	window.elementorCommon = {
		config: {
			editor_events: {
				can_send_events: false,
				mixpanelInstance: { isInitialized: true },
			},
			library_connect: {
				is_connected: false,
			},
		},
		eventsManager: {
			dispatchEvent: mockDispatchEvent,
			isMixpanelReady: () => true,
			trackingEnabled: false,
			enableTracking: jest.fn(),
			initializeMixpanel: jest.fn( ( callback ) => callback() ),
		},
	};

	window.elementorAppConfig = {
		onboarding: {
			isExperiment101Enabled: false,
			isExperiment201Enabled: false,
			isExperiment202Enabled: false,
			isExperiment401Enabled: false,
			isExperiment402Enabled: false,
		},
	};
} );

afterEach( () => {
	delete window.elementorCommon;
	delete window.elementorAppConfig;
	jest.resetModules();
} );

describe( 'onboarding tracker', () => {
	test( 'queues initialized on load', () => {
		const tracker = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/onboarding-tracker.js' ).default;
		const { getEventQueue } = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/event-queue.js' );

		tracker.initiateCoreOnboarding();

		expect( getEventQueue().some( ( item ) => 'core_onboarding_initialized' === item.name ) ).toBe( true );
		expect( mockDispatchEvent ).not.toHaveBeenCalled();
	} );

	test( 'sends queued items after connect success', () => {
		const tracker = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/onboarding-tracker.js' ).default;

		tracker.initiateCoreOnboarding();
		tracker.sendEventOrStore( 'STEP1_CLICKED_CONNECT', { currentStep: 1 } );

		window.elementorCommon.config.editor_events.can_send_events = true;
		tracker.sendConnectionSuccessEvents( {
			tracking_opted_in: true,
			access_tier: 'free',
		} );

		expect( mockDispatchEvent.mock.calls.some( ( call ) => 'core_onboarding_connect' === call[ 0 ] ) ).toBe( true );
		expect( mockDispatchEvent.mock.calls.some( ( call ) => 'core_onboarding_initialized' === call[ 0 ] ) ).toBe( true );
	} );

	test( 'does not send when never opted in', () => {
		const tracker = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/onboarding-tracker.js' ).default;

		tracker.initiateCoreOnboarding();
		tracker.onStepLoad( 2 );
		tracker.sendThemeInstalled( 'hello' );

		expect( mockDispatchEvent ).not.toHaveBeenCalled();
	} );
} );
