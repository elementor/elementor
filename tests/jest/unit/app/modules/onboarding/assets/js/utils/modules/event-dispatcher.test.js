const mockDispatchEvent = jest.fn( () => true );

beforeEach( () => {
	sessionStorage.clear();
	mockDispatchEvent.mockClear();

	window.elementorCommon = {
		config: {
			editor_events: {
				can_send_events: false,
				mixpanelInstance: { isInitialized: true },
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
} );

afterEach( () => {
	delete window.elementorCommon;
} );

describe( 'onboarding event dispatcher', () => {
	test( 'queues payload when sending is not allowed', () => {
		const { trackEvent } = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/event-dispatcher.js' );
		const { getEventQueue } = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/event-queue.js' );

		trackEvent( 'core_onboarding_initialized', {
			interaction_type: 'load',
			target_type: 'loaded',
			target_name: 'onboarding_first_load',
			interaction_result: 'onboarding_loaded',
			target_location: 'onboarding',
		} );

		expect( mockDispatchEvent ).not.toHaveBeenCalled();
		expect( getEventQueue() ).toHaveLength( 1 );
		expect( getEventQueue()[ 0 ].payload ).toMatchObject( {
			window_name: 'core_onboarding',
			target_name: 'onboarding_first_load',
		} );
	} );

	test( 'sends queued items after consent', () => {
		jest.resetModules();
		window.elementorCommon.config.editor_events.can_send_events = true;

		const { trackEvent, flushQueue } = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/event-dispatcher.js' );

		trackEvent( 'core_onboarding_login_type', {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'login',
			interaction_result: 'login_option selected',
			target_value: 'connect',
			target_location: 'onboarding',
			location_l1: 'login_step',
		} );

		expect( mockDispatchEvent ).toHaveBeenCalledTimes( 1 );

		window.elementorCommon.config.editor_events.can_send_events = false;
		trackEvent( 'core_onboarding_skip_clicked', {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'skip',
			interaction_result: 'skip_step',
			target_value: '1',
			target_location: 'onboarding_navigation',
			location_l1: 'footer',
			location_l2: '1',
		} );

		expect( mockDispatchEvent ).toHaveBeenCalledTimes( 1 );

		window.elementorCommon.config.editor_events.can_send_events = true;
		flushQueue();

		expect( mockDispatchEvent ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'defers flush until async init completes', () => {
		jest.resetModules();

		let initCallback = null;
		window.elementorCommon.config.editor_events.can_send_events = false;
		window.elementorCommon.config.editor_events.mixpanelInstance = null;
		window.elementorCommon.eventsManager.isMixpanelReady = () => false;
		window.elementorCommon.eventsManager.trackingEnabled = false;
		window.elementorCommon.eventsManager.initializeMixpanel = jest.fn( ( callback ) => {
			initCallback = callback;
		} );

		const { trackEvent, flushQueue } = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/event-dispatcher.js' );

		trackEvent( 'core_onboarding_initialized', {
			interaction_type: 'load',
			target_type: 'loaded',
			target_name: 'onboarding_first_load',
			interaction_result: 'onboarding_loaded',
			target_location: 'onboarding',
		} );

		window.elementorCommon.config.editor_events.can_send_events = true;
		flushQueue();

		expect( mockDispatchEvent ).not.toHaveBeenCalled();
		expect( window.elementorCommon.eventsManager.initializeMixpanel ).toHaveBeenCalledTimes( 1 );

		initCallback();
		expect( window.elementorCommon.eventsManager.enableTracking ).toHaveBeenCalled();
		expect( mockDispatchEvent ).toHaveBeenCalledTimes( 1 );
		expect( mockDispatchEvent ).toHaveBeenCalledWith(
			'core_onboarding_initialized',
			expect.objectContaining( { target_name: 'onboarding_first_load' } ),
		);
	} );
} );
