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

	test( 'does not mark experiment started when dispatch is not ready', () => {
		window.elementorAppConfig.onboarding.isExperiment101Enabled = true;
		window.elementorCommon.config.editor_events.can_send_events = true;
		window.elementorCommon.config.editor_events.mixpanelInstance = null;
		window.elementorCommon.eventsManager.isMixpanelReady = () => false;

		const tracker = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/onboarding-tracker.js' ).default;
		const { ONBOARDING_STORAGE_KEYS } = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/onboarding-tracker.js' );
		const StorageManager = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/storage-manager.js' ).default;

		tracker.sendExperimentStarted( 101 );

		expect( mockDispatchEvent ).not.toHaveBeenCalled();
		expect( StorageManager.exists( ONBOARDING_STORAGE_KEYS.EXPERIMENT101_STARTED ) ).toBe( false );
		expect( StorageManager.getArray( ONBOARDING_STORAGE_KEYS.PENDING_EXPERIMENT_DATA ) ).toHaveLength( 1 );
	} );

	test( 'flushes queued onboarding events before stored experiment events', () => {
		jest.resetModules();

		let initCallback = null;
		const dispatchOrder = [];
		mockDispatchEvent.mockImplementation( ( name ) => {
			dispatchOrder.push( name );
			return true;
		} );

		window.elementorCommon.config.editor_events.can_send_events = false;
		window.elementorCommon.config.editor_events.mixpanelInstance = null;
		window.elementorCommon.eventsManager.isMixpanelReady = () => false;
		window.elementorCommon.eventsManager.initializeMixpanel = jest.fn( ( callback ) => {
			initCallback = callback;
		} );
		window.elementorAppConfig.onboarding.isExperiment101Enabled = true;

		const tracker = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/onboarding-tracker.js' ).default;
		const { ONBOARDING_STORAGE_KEYS } = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/onboarding-tracker.js' );
		const StorageManager = require( '../../../../../../../../../../app/modules/onboarding/assets/js/utils/modules/storage-manager.js' ).default;

		tracker.initiateCoreOnboarding();
		tracker.sendExperimentStarted( 101 );

		window.elementorCommon.config.editor_events.can_send_events = true;
		tracker.sendConnectionSuccessEvents( {
			tracking_opted_in: true,
			access_tier: 'free',
		} );

		expect( mockDispatchEvent ).not.toHaveBeenCalled();

		window.elementorCommon.config.editor_events.mixpanelInstance = { isInitialized: true };
		window.elementorCommon.eventsManager.isMixpanelReady = () => true;
		initCallback();

		expect( dispatchOrder.indexOf( 'core_onboarding_initialized' ) ).toBeLessThan(
			dispatchOrder.indexOf( '$experiment_started' ),
		);
		expect( StorageManager.exists( ONBOARDING_STORAGE_KEYS.EXPERIMENT101_STARTED ) ).toBe( true );
	} );
} );
