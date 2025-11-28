import eventsConfig from '../../../../../../../core/common/modules/events-manager/assets/js/events-config';
import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';
import EventDispatcher, { ONBOARDING_EVENTS_MAP, ONBOARDING_STEP_NAMES } from './event-dispatcher.js';
import TimingManager from './timing-manager.js';
import PostOnboardingTracker from './post-onboarding-tracker.js';

class OnboardingTracker {
	constructor() {
		this.initializeEventConfigs();
		this.initializeEventListeners();
	}

	initializeEventConfigs() {
		this.EVENT_CONFIGS = {
			SKIP: {
				eventName: ONBOARDING_EVENTS_MAP.SKIP,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_SKIP,
				basePayload: {
					location: 'plugin_onboarding',
				},
				payloadBuilder: ( eventData ) => ( {
					action_step: eventData.currentStep,
					skip_timestamp: eventData.timestamp,
				} ),
				excludeFields: [ 'step_number', 'trigger' ],
			},
			TOP_UPGRADE: {
				eventName: ONBOARDING_EVENTS_MAP.TOP_UPGRADE,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE,
				isArray: true,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: 'upgrade_interaction',
				},
				payloadBuilder: ( eventData ) => ( {
					action_step: eventData.currentStep,
					upgrade_clicked: eventData.upgradeClicked,
				} ),
				excludeFields: [ 'event_timestamp', 'upgrade_location', 'trigger', 'step_number' ],
			},
			CREATE_MY_ACCOUNT: {
				eventName: ONBOARDING_EVENTS_MAP.CREATE_MY_ACCOUNT,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: 'upgrade_interaction',
				},
				payloadBuilder: ( eventData ) => ( {
					action_step: eventData.currentStep,
					create_account_clicked: this.validateCreateAccountClicked( eventData.createAccountClicked ),
				} ),
				excludeFields: [ 'trigger', 'step_number' ],
			},
			CREATE_ACCOUNT_STATUS: {
				eventName: ONBOARDING_EVENTS_MAP.CREATE_ACCOUNT_STATUS,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: 'create_flow_returns_status',
				},
				payloadBuilder: ( eventData ) => ( {
					onboarding_create_account_status: this.validateCreateAccountStatus( eventData.status ),
				} ),
				excludeFields: [ 'trigger' ],
			},
			CONNECT_STATUS: {
				eventName: ONBOARDING_EVENTS_MAP.CONNECT_STATUS,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: 'connect_flow_returns_status',
				},
				payloadBuilder: ( eventData ) => ( {
					onboarding_connect_status: this.validateConnectStatus( eventData.status ),
					tracking_opted_in: eventData.trackingOptedIn,
					user_tier: eventData.userTier,
				} ),
				stepOverride: 1,
				stepNameOverride: ONBOARDING_STEP_NAMES.CONNECT,
				excludeFields: [ 'trigger' ],
			},
			STEP1_CLICKED_CONNECT: {
				eventName: ONBOARDING_EVENTS_MAP.STEP1_CLICKED_CONNECT,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: eventsConfig.triggers.click,
				},
				payloadBuilder: () => ( {} ),
				stepOverride: 1,
				stepNameOverride: ONBOARDING_STEP_NAMES.CONNECT,
				excludeFields: [ 'trigger' ],
			},
			STEP1_END_STATE: {
				eventName: ONBOARDING_EVENTS_MAP.STEP1_END_STATE,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE,
				isRawPayload: true,
				payloadBuilder: ( eventData ) => eventData,
			},
			EXIT: {
				eventName: ONBOARDING_EVENTS_MAP.EXIT,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_EXIT,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: 'user_action',
				},
				payloadBuilder: ( eventData ) => {
					const stepNumber = this.getStepNumber( eventData.currentStep );
					const stepName = this.getStepName( stepNumber );
					return {
						action_step: `${ stepNumber }/${ stepName }`,
						exit_type: eventData.exitType || 'x_button',
					};
				},
				excludeFields: [ 'trigger', 'step_number' ],
			},
			AB_101_START_AS_FREE_USER: {
				eventName: ONBOARDING_EVENTS_MAP.AB_101_START_AS_FREE_USER,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_AB_101_START_AS_FREE_USER,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: 'continue_as_guest_clicked',
				},
				payloadBuilder: ( eventData ) => ( {
					action_step: eventData.currentStep,
				} ),
				stepOverride: 1,
				stepNameOverride: ONBOARDING_STEP_NAMES.CONNECT,
				excludeFields: [ 'trigger', 'step_number' ],
			},
		};
	}

	initializeEventListeners() {
		if ( 'undefined' === typeof document ) {
			return;
		}

		document.addEventListener( 'click', ( event ) => {
			const cardGridElement = event.target.closest( '.e-onboarding__cards-grid' );
			if ( cardGridElement ) {
				this.handleStep4CardClick( event );
			}
		}, true );

		this.setupUrlChangeDetection();
		this.setupSessionRecordingCleanup();
	}

	setupSessionRecordingCleanup() {
		if ( 'undefined' === typeof window ) {
			return;
		}

		this.handleBeforeUnload = this.handleBeforeUnload.bind( this );
		window.addEventListener( 'beforeunload', this.handleBeforeUnload );
	}

	handleBeforeUnload() {
		this.stopSessionRecordingIfNeeded();
	}

	onDestroy() {
		this.stopSessionRecordingIfNeeded();
		window.removeEventListener( 'beforeunload', this.handleBeforeUnload );
	}

	setupUrlChangeDetection() {
		let lastUrl = window.location.href;
		const urlChangeDetector = () => {
			const currentUrl = window.location.href;
			if ( currentUrl !== lastUrl ) {
				const isStep4 = currentUrl.includes( 'goodToGo' ) || currentUrl.includes( 'step4' ) || currentUrl.includes( 'site_starter' );
				if ( isStep4 ) {
					setTimeout( () => {
						TimingManager.trackStepStartTime( 4 );
						this.checkAndSendReturnToStep4();
					}, 100 );
				}

				lastUrl = currentUrl;
			}
		};

		setInterval( urlChangeDetector, 500 );

		window.addEventListener( 'popstate', () => {
			setTimeout( urlChangeDetector, 100 );
		} );
	}

	dispatchEvent( eventName, payload ) {
		return EventDispatcher.dispatch( eventName, payload );
	}

	dispatchEventWithoutTrigger( eventName, payload ) {
		const cleanPayload = { ...payload };
		delete cleanPayload.trigger;
		return EventDispatcher.dispatch( eventName, cleanPayload );
	}

	sendEventOrStore( eventType, eventData ) {
		if ( 'TOP_UPGRADE' === eventType && 'no_click' !== eventData.upgradeClicked ) {
			const stepNumber = this.getStepNumber( eventData.currentStep );
			this.markUpgradeClickSent( stepNumber );
		}

		if ( EventDispatcher.canSendEvents() ) {
			return this.sendEventDirect( eventType, eventData );
		}
		this.storeEventForLater( eventType, eventData );
	}

	sendEventDirect( eventType, eventData ) {
		const config = this.EVENT_CONFIGS[ eventType ];
		if ( ! config ) {
			return;
		}

		if ( config.isRawPayload ) {
			return this.dispatchEvent( config.eventName, eventData );
		}

		const stepNumber = config.stepOverride || this.getStepNumber( eventData.currentStep );
		const stepName = config.stepNameOverride || this.getStepName( stepNumber );

		const eventPayload = EventDispatcher.createStepEventPayload(
			stepNumber,
			stepName,
			{
				...config.basePayload,
				...config.payloadBuilder( eventData ),
			},
		);

		if ( config.excludeFields ) {
			config.excludeFields.forEach( ( field ) => {
				delete eventPayload[ field ];
			} );
		}

		return this.dispatchEvent( config.eventName, eventPayload );
	}

	storeEventForLater( eventType, eventData ) {
		const config = this.EVENT_CONFIGS[ eventType ];
		if ( ! config ) {
			return;
		}

		const dataWithTimestamp = {
			...eventData,
			timestamp: TimingManager.getCurrentTime(),
		};

		if ( config.isArray ) {
			const existingEvents = StorageManager.getArray( config.storageKey );
			existingEvents.push( dataWithTimestamp );
			StorageManager.setObject( config.storageKey, existingEvents );
		} else {
			StorageManager.setObject( config.storageKey, dataWithTimestamp );
		}
	}

	sendStoredEvent( eventType ) {
		const config = this.EVENT_CONFIGS[ eventType ];
		if ( ! config ) {
			return;
		}

		const storedData = config.isArray
			? StorageManager.getArray( config.storageKey )
			: StorageManager.getObject( config.storageKey );

		if ( ! storedData || ( config.isArray && 0 === storedData.length ) ) {
			return;
		}

		if ( 'CONNECT_STATUS' === eventType && storedData && ! storedData.status ) {
			storedData.status = 'fail';
		}

		if ( 'CREATE_ACCOUNT_STATUS' === eventType && storedData && ! storedData.status ) {
			storedData.status = 'fail';
		}

		if ( 'CREATE_MY_ACCOUNT' === eventType && storedData && ! storedData.createAccountClicked ) {
			storedData.createAccountClicked = 'main_cta';
		}

		const processEvent = ( eventData ) => {
			if ( config.isRawPayload ) {
				this.dispatchEvent( config.eventName, eventData );
				return;
			}

			const stepNumber = config.stepOverride || this.getStepNumber( eventData.currentStep );
			const stepName = config.stepNameOverride || this.getStepName( stepNumber );

			const eventPayload = EventDispatcher.createStepEventPayload(
				stepNumber,
				stepName,
				{
					...config.basePayload,
					...config.payloadBuilder( eventData ),
				},
			);

			if ( config.excludeFields ) {
				config.excludeFields.forEach( ( field ) => {
					delete eventPayload[ field ];
				} );
			}

			this.dispatchEvent( config.eventName, eventPayload );
		};

		if ( config.isArray ) {
			storedData.forEach( processEvent );
		} else {
			processEvent( storedData );
		}

		StorageManager.remove( config.storageKey );
	}

	updateLibraryConnectConfig( data ) {
		if ( ! elementorCommon.config.library_connect ) {
			return;
		}

		elementorCommon.config.library_connect.is_connected = true;
		elementorCommon.config.library_connect.current_access_level = data.kits_access_level || data.access_level || 0;
		elementorCommon.config.library_connect.current_access_tier = data.access_tier;
		elementorCommon.config.library_connect.plan_type = data.plan_type;
		elementorCommon.config.library_connect.user_id = data.user_id || null;
	}

	sendUpgradeNowStep3( selectedFeatures, currentStep ) {
		const proFeaturesChecked = this.extractSelectedFeatureKeys( selectedFeatures );

		return EventDispatcher.dispatchStepEvent(
			ONBOARDING_EVENTS_MAP.UPGRADE_NOW_S3,
			currentStep,
			ONBOARDING_STEP_NAMES.PRO_FEATURES,
			{
				location: 'plugin_onboarding',
				pro_features_checked: proFeaturesChecked,
			},
		);
	}

	extractSelectedFeatureKeys( selectedFeatures ) {
		if ( ! selectedFeatures || typeof selectedFeatures !== 'object' ) {
			return [];
		}

		if ( Array.isArray( selectedFeatures ) ) {
			return this.extractFromLegacyArrayFormat( selectedFeatures );
		}

		return this.extractFromObjectFormat( selectedFeatures );
	}

	extractFromLegacyArrayFormat( selectedFeatures ) {
		return selectedFeatures
			.filter( ( feature ) => feature && feature.is_checked )
			.map( ( feature ) => feature.key )
			.filter( ( key ) => key );
	}

	extractFromObjectFormat( selectedFeatures ) {
		const allFeatures = [];

		if ( Array.isArray( selectedFeatures.essential ) ) {
			allFeatures.push( ...selectedFeatures.essential );
		}

		if ( Array.isArray( selectedFeatures.advanced ) ) {
			allFeatures.push( ...selectedFeatures.advanced );
		}

		return allFeatures;
	}

	sendTopUpgrade( currentStep, upgradeClicked ) {
		const stepNumber = this.getStepNumber( currentStep );
		if ( stepNumber ) {
			this.trackStepAction( stepNumber, 'top_upgrade', {
				upgrade_clicked: upgradeClicked,
			} );
		}

		return this.sendEventOrStore( 'TOP_UPGRADE', { currentStep, upgradeClicked } );
	}

	cancelDelayedNoClickEvent() {
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK );
	}

	initiateCoreOnboarding() {
		StorageManager.clearAllOnboardingData();
		TimingManager.clearStaleSessionData();
		TimingManager.initializeOnboardingStartTime();
	}

	sendCoreOnboardingInitiated() {
		const startTime = TimingManager.initializeOnboardingStartTime();

		const eventData = {
			location: 'plugin_onboarding',
			step_name: ONBOARDING_STEP_NAMES.ONBOARDING_START,
			onboarding_start_time: startTime,
		};

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.CORE_ONBOARDING, eventData );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.INITIATED );
	}

	storeSiteStarterChoice( siteStarter ) {
		const existingChoice = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );

		if ( this.isReturnScenario( existingChoice, siteStarter ) ) {
			this.sendReturnEventAndUpdateChoice( existingChoice, siteStarter );
		} else {
			this.storeInitialChoice( siteStarter );
		}
	}

	isReturnScenario( existingChoice, siteStarter ) {
		return existingChoice && existingChoice.site_starter !== siteStarter;
	}

	sendReturnEventAndUpdateChoice( existingChoice, siteStarter ) {
		const returnEventPayload = this.createReturnEventPayload( existingChoice, siteStarter );
		this.dispatchEventWithoutTrigger( ONBOARDING_EVENTS_MAP.STEP4_RETURN_STEP4, returnEventPayload );
		this.updateChoiceWithReturnTracking( existingChoice, siteStarter );
	}

	createReturnEventPayload( existingChoice, siteStarter ) {
		return EventDispatcher.createStepEventPayload(
			4,
			ONBOARDING_STEP_NAMES.SITE_STARTER,
			{
				location: 'plugin_onboarding',
				trigger: 'user_returns_to_onboarding',
				return_to_onboarding: existingChoice.site_starter,
				original_choice_timestamp: existingChoice.timestamp,
				new_choice: siteStarter,
			},
		);
	}

	updateChoiceWithReturnTracking( existingChoice, siteStarter ) {
		const choiceData = {
			site_starter: siteStarter,
			original_choice: existingChoice.site_starter,
			timestamp: TimingManager.getCurrentTime(),
			return_event_sent: true,
		};

		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, choiceData );
	}

	storeInitialChoice( siteStarter ) {
		const choiceData = {
			site_starter: siteStarter,
			timestamp: TimingManager.getCurrentTime(),
			return_event_sent: false,
		};

		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, choiceData );
	}

	checkAndSendReturnToStep4() {
		const choiceData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		if ( ! choiceData ) {
			return;
		}

		if ( this.shouldSendReturnEvent( choiceData ) ) {
			const returnEventPayload = this.createReturnEventPayloadFromStoredData( choiceData );
			this.dispatchEventWithoutTrigger( ONBOARDING_EVENTS_MAP.STEP4_RETURN_STEP4, returnEventPayload );
			this.markReturnEventAsSent( choiceData );
		}

		this.resetStep4EndStateTracking();
	}

	resetStep4EndStateTracking() {
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.STEP4_END_STATE_SENT );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.STEP4_ACTIONS );

		this.trackStepAction( 4, 'returned_to_step4', {
			return_detected: true,
			timestamp: TimingManager.getCurrentTime(),
		} );
	}

	shouldSendReturnEvent( choiceData ) {
		return ! choiceData.return_event_sent &&
			choiceData.original_choice &&
			choiceData.original_choice !== choiceData.site_starter;
	}

	createReturnEventPayloadFromStoredData( choiceData ) {
		return EventDispatcher.createStepEventPayload(
			4,
			ONBOARDING_STEP_NAMES.SITE_STARTER,
			{
				location: 'plugin_onboarding',
				trigger: 'user_returns_to_onboarding',
				return_to_onboarding: choiceData.original_choice,
				original_choice_timestamp: choiceData.timestamp,
				new_choice: choiceData.site_starter,
			},
		);
	}

	markReturnEventAsSent( choiceData ) {
		choiceData.return_event_sent = true;
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, choiceData );
	}

	handleSiteStarterChoice( siteStarter ) {
		TimingManager.trackStepStartTime( 4 );
		this.storeSiteStarterChoice( siteStarter );
		this.trackStepAction( 4, 'site_starter', {
			source_type: siteStarter,
		} );
		this.sendStep4SiteStarter( siteStarter );
		this.sendStepEndState( 4 );
	}

	sendStep4SiteStarter( siteStarter ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.STEP4_SITE_STARTER,
				4,
				ONBOARDING_STEP_NAMES.SITE_STARTER,
				{
					location: 'plugin_onboarding',
					site_starter: siteStarter,
				},
			);
		}
	}

	checkAndSendEditorLoadedFromOnboarding() {
		return PostOnboardingTracker.checkAndSendEditorLoadedFromOnboarding();
	}

	sendExitButtonEvent( currentStep ) {
		const stepNumber = this.getStepNumber( currentStep );

		this.trackStepAction( stepNumber, 'exit:x_button', {
			exit_type: 'x_button',
		} );
		this.sendStepEndState( stepNumber );

		return this.sendEventOrStore( 'EXIT', {
			currentStep,
			exitType: 'x_button',
		} );
	}

	trackStepAction( stepNumber, action, additionalData = {} ) {
		const stepConfig = this.getStepConfig( stepNumber );
		if ( stepConfig ) {
			this.trackStepActionInternal( stepNumber, action, stepConfig.storageKey, additionalData );
		}
	}

	sendStepEndState( stepNumber ) {
		const stepConfig = this.getStepConfig( stepNumber );
		if ( stepConfig ) {
			this.sendStepEndStateInternal(
				stepNumber,
				stepConfig.storageKey,
				stepConfig.eventName,
				stepConfig.stepName,
				stepConfig.endStateProperty,
			);
		}
	}

	trackStepActionInternal( stepNumber, action, storageKey, additionalData = {} ) {
		const stepConfig = this.getStepConfig( stepNumber );
		const actualStorageKey = storageKey || ( stepConfig ? stepConfig.storageKey : null );

		if ( ! actualStorageKey ) {
			return;
		}

		const existingActions = StorageManager.getArray( actualStorageKey );
		const actionData = { action, timestamp: TimingManager.getCurrentTime(), ...additionalData };

		existingActions.push( actionData );
		StorageManager.setObject( actualStorageKey, existingActions );
	}

	getEndStateSentKey( stepNumber ) {
		const endStateKeys = {
			1: ONBOARDING_STORAGE_KEYS.STEP1_END_STATE_SENT,
			2: ONBOARDING_STORAGE_KEYS.STEP2_END_STATE_SENT,
			3: ONBOARDING_STORAGE_KEYS.STEP3_END_STATE_SENT,
			4: ONBOARDING_STORAGE_KEYS.STEP4_END_STATE_SENT,
		};
		return endStateKeys[ stepNumber ];
	}

	sendStepEndStateInternal( stepNumber, storageKey, eventName, stepName, endStateProperty ) {
		const initialActions = StorageManager.getArray( storageKey );
		this.sendHoverEventsFromStepActions( initialActions, stepNumber );

		const actions = StorageManager.getArray( storageKey );
		if ( 0 === actions.length ) {
			return;
		}

		const endStateSentKey = this.getEndStateSentKey( stepNumber );
		if ( StorageManager.exists( endStateSentKey ) ) {
			return;
		}

		let eventData = EventDispatcher.createStepEventPayload( stepNumber, stepName, {
			location: 'plugin_onboarding',
			trigger: 'user_redirects_out_of_step',
		} );

		eventData = TimingManager.addTimingToEventData( eventData, stepNumber );
		eventData[ endStateProperty ] = actions;

		if ( 4 === stepNumber ) {
			this.stopSessionRecordingIfNeeded();
		}

		if ( EventDispatcher.canSendEvents() ) {
			this.dispatchEventWithoutTrigger( eventName, eventData );
			StorageManager.remove( storageKey );
			StorageManager.setString( endStateSentKey, 'true' );
			TimingManager.clearStepStartTime( stepNumber );
			this.sendStoredEventsIfConnected();
		} else if ( 1 === stepNumber ) {
			this.storeStep1EndStateForLater( eventData, storageKey );
		} else {
			this.dispatchEventWithoutTrigger( eventName, eventData );
			StorageManager.remove( storageKey );
			StorageManager.setString( endStateSentKey, 'true' );
			TimingManager.clearStepStartTime( stepNumber );
		}
	}

	getStepNumber( pageId ) {
		if ( this.isNumericPageId( pageId ) ) {
			return pageId;
		}

		if ( this.isStringNumericPageId( pageId ) ) {
			return this.convertStringToNumber( pageId );
		}

		return this.mapPageIdToStepNumber( pageId );
	}

	isNumericPageId( pageId ) {
		return 'number' === typeof pageId;
	}

	isStringNumericPageId( pageId ) {
		return 'string' === typeof pageId && ! isNaN( pageId );
	}

	convertStringToNumber( pageId ) {
		return parseInt( pageId, 10 );
	}

	mapPageIdToStepNumber( pageId ) {
		const stepMappings = this.getStepMappings();
		const mappedStep = stepMappings[ pageId ];
		return mappedStep || null;
	}

	getStepMappings() {
		return {
			account: 1,
			connect: 1,
			hello: 2,
			hello_biz: 2,
			chooseFeatures: 3,
			pro_features: 3,
			site_starter: 4,
			goodToGo: 4,
			siteName: 5,
			siteLogo: 6,
		};
	}

	getStepName( stepNumber ) {
		const stepNames = {
			1: ONBOARDING_STEP_NAMES.CONNECT,
			2: ONBOARDING_STEP_NAMES.HELLO_BIZ,
			3: ONBOARDING_STEP_NAMES.PRO_FEATURES,
			4: ONBOARDING_STEP_NAMES.SITE_STARTER,
			5: ONBOARDING_STEP_NAMES.SITE_NAME,
			6: ONBOARDING_STEP_NAMES.SITE_LOGO,
		};

		return stepNames[ stepNumber ] || 'unknown';
	}

	getStepConfig( stepNumber ) {
		const stepConfigs = {
			1: {
				storageKey: ONBOARDING_STORAGE_KEYS.STEP1_ACTIONS,
				eventName: ONBOARDING_EVENTS_MAP.STEP1_END_STATE,
				stepName: ONBOARDING_STEP_NAMES.CONNECT,
				endStateProperty: 'step1_actions',
			},
			2: {
				storageKey: ONBOARDING_STORAGE_KEYS.STEP2_ACTIONS,
				eventName: ONBOARDING_EVENTS_MAP.STEP2_END_STATE,
				stepName: ONBOARDING_STEP_NAMES.HELLO_BIZ,
				endStateProperty: 'step2_actions',
			},
			3: {
				storageKey: ONBOARDING_STORAGE_KEYS.STEP3_ACTIONS,
				eventName: ONBOARDING_EVENTS_MAP.STEP3_END_STATE,
				stepName: ONBOARDING_STEP_NAMES.PRO_FEATURES,
				endStateProperty: 'step3_actions',
			},
			4: {
				storageKey: ONBOARDING_STORAGE_KEYS.STEP4_ACTIONS,
				eventName: ONBOARDING_EVENTS_MAP.STEP4_END_STATE,
				stepName: ONBOARDING_STEP_NAMES.SITE_STARTER,
				endStateProperty: 'step4_actions',
			},
		};

		return stepConfigs[ stepNumber ] || null;
	}

	sendConnectionSuccessEvents( data ) {
		this.sendCoreOnboardingInitiated();
		this.sendAppropriateStatusEvent( 'success', data );
		this.sendAllStoredEvents();
	}

	sendConnectionFailureEvents() {
		this.sendAppropriateStatusEvent( 'fail' );
	}

	validateConnectStatus( status ) {
		if ( 'success' === status || 'fail' === status ) {
			return status;
		}
		return 'fail';
	}

	validateCreateAccountStatus( status ) {
		if ( 'success' === status || 'fail' === status ) {
			return status;
		}
		return 'fail';
	}

	validateCreateAccountClicked( clickedValue ) {
		if ( 'topbar' === clickedValue || 'main_cta' === clickedValue ) {
			return clickedValue;
		}
		return 'main_cta';
	}

	sendAppropriateStatusEvent( status, data = null ) {
		const hasCreateAccountAction = StorageManager.exists( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );

		if ( hasCreateAccountAction ) {
			this.sendEventDirect( 'CREATE_ACCOUNT_STATUS', { status, currentStep: 1 } );
		}

		const trackingOptedIn = data?.tracking_opted_in || false;
		const userTier = data?.access_tier || null;
		this.sendEventDirect( 'CONNECT_STATUS', { status, trackingOptedIn, userTier } );
	}

	sendAllStoredEvents() {
		this.sendStoredExperimentData();
		this.sendStoredEvent( 'SKIP' );
		this.sendStoredEvent( 'TOP_UPGRADE' );
		this.sendStoredEvent( 'CREATE_MY_ACCOUNT' );
		this.sendStoredEvent( 'CREATE_ACCOUNT_STATUS' );
		this.sendStoredEvent( 'CONNECT_STATUS' );
		this.sendStoredEvent( 'STEP1_CLICKED_CONNECT' );
		this.sendStoredEvent( 'STEP1_END_STATE' );
		this.sendStoredEvent( 'EXIT' );
		this.sendStoredEvent( 'AB_101_START_AS_FREE_USER' );
	}

	sendStoredEventsIfConnected() {
		if ( EventDispatcher.canSendEvents() ) {
			this.sendAllStoredEvents();
		}
	}

	handleStep4CardClick() {
		const hasPreviousClick = StorageManager.exists( ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK );

		if ( hasPreviousClick ) {
			this.checkAndSendReturnToStep4();
		} else {
			StorageManager.setString( ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK, 'true' );
		}
	}

	setupAllUpgradeButtons( currentStep ) {
		const upgradeButtons = document.querySelectorAll(
			'.elementor-button[href*="upgrade"], .e-btn[href*="upgrade"], .eps-button[href*="upgrade"]',
		);

		upgradeButtons.forEach( ( button ) => {
			this.setupSingleUpgradeButton( button, currentStep );
		} );

		return upgradeButtons.length;
	}

	setupSingleUpgradeButton( buttonElement, currentStep ) {
		if ( ! this.isValidButtonElement( buttonElement ) ) {
			return null;
		}

		this.cleanupButtonTracking( buttonElement );

		if ( this.isButtonAlreadyTrackedForStep( buttonElement, currentStep ) ) {
			return null;
		}

		this.markButtonAsTracked( buttonElement, currentStep );
		const eventHandlers = this.createUpgradeButtonEventHandlers( buttonElement, currentStep );
		this.attachEventHandlersToButton( buttonElement, eventHandlers );

		return () => {
			this.cleanupButtonTracking( buttonElement );
		};
	}

	isValidButtonElement( buttonElement ) {
		return !! buttonElement;
	}

	isButtonAlreadyTrackedForStep( buttonElement, currentStep ) {
		const existingStep = buttonElement.dataset.onboardingStep;
		return buttonElement.dataset.onboardingTracked && existingStep === currentStep;
	}

	markButtonAsTracked( buttonElement, currentStep ) {
		buttonElement.dataset.onboardingTracked = 'true';
		buttonElement.dataset.onboardingStep = currentStep;
	}

	createUpgradeButtonEventHandlers( buttonElement, currentStep ) {
		let hasClicked = false;
		let hasHovered = false;

		const handleMouseEnter = () => {
			if ( ! hasHovered ) {
				hasHovered = true;
				this.trackUpgradeHoverAction( currentStep, buttonElement );
			}
		};

		const handleMouseLeave = () => {
		};

		const handleClick = () => {
			if ( this.preventDuplicateClick( hasClicked ) ) {
				return;
			}

			hasClicked = true;
			this.sendUpgradeClickEvent( buttonElement, currentStep );
		};

		return { handleMouseEnter, handleMouseLeave, handleClick };
	}

	preventDuplicateClick( hasClicked ) {
		return hasClicked;
	}

	sendUpgradeClickEvent( buttonElement, currentStep ) {
		const upgradeClickedValue = this.determineUpgradeClickedValue( buttonElement );
		const stepNumber = this.getStepNumber( currentStep );

		if ( stepNumber ) {
			const stepConfig = this.getStepConfig( stepNumber );
			const hoverData = this.pendingHoverActions && this.pendingHoverActions[ stepNumber ];

			if ( stepConfig ) {
				const actualStorageKey = stepConfig.storageKey;
				const existingActions = StorageManager.getArray( actualStorageKey );

				const noClickIndex = existingActions.findIndex( ( action ) =>
					'upgrade_topbar' === action.action &&
					'no_click' === action.upgrade_clicked,
				);

				if ( noClickIndex !== -1 ) {
					existingActions.splice( noClickIndex, 1 );
					StorageManager.setObject( actualStorageKey, existingActions );
				}
			}

			const actionData = {
				upgrade_clicked: upgradeClickedValue,
				click_timestamp: TimingManager.getCurrentTime(),
			};

			if ( hoverData ) {
				actionData.upgrade_hovered = hoverData.upgrade_hovered;
				actionData.hover_timestamp = hoverData.hover_timestamp;
			}

			this.trackStepAction( stepNumber, 'upgrade_topbar', actionData );

			if ( this.pendingHoverActions && this.pendingHoverActions[ stepNumber ] ) {
				delete this.pendingHoverActions[ stepNumber ];
			}
		}

		this.sendEventOrStore( 'TOP_UPGRADE', { currentStep, upgradeClicked: upgradeClickedValue } );
	}

	trackUpgradeHoverAction( currentStep, buttonElement ) {
		const stepNumber = this.getStepNumber( currentStep );
		if ( ! stepNumber ) {
			return;
		}

		const upgradeHoverValue = this.determineUpgradeClickedValue( buttonElement );

		if ( ! this.pendingHoverActions ) {
			this.pendingHoverActions = {};
		}

		this.pendingHoverActions[ stepNumber ] = {
			upgrade_hovered: upgradeHoverValue,
			hover_timestamp: TimingManager.getCurrentTime(),
		};
	}

	sendHoverEventsFromStepActions( actions, stepNumber ) {
		if ( ! this.pendingHoverActions || ! this.pendingHoverActions[ stepNumber ] ) {
			return;
		}

		const hasUpgradeTopbarInActions = actions.some( ( action ) =>
			action.action &&
			'upgrade_topbar' === action.action,
		);

		const hasStoredClickEvent = this.hasExistingUpgradeClickEvent( stepNumber );
		const hasClickBeenSent = this.hasUpgradeClickBeenSent( stepNumber );

		if ( hasUpgradeTopbarInActions || hasStoredClickEvent || hasClickBeenSent ) {
			return;
		}

		const hoverData = this.pendingHoverActions[ stepNumber ];
		const stepConfig = this.getStepConfig( stepNumber );

		if ( stepConfig ) {
			this.trackStepActionInternal( stepNumber, 'upgrade_topbar', stepConfig.storageKey, {
				upgrade_clicked: 'no_click',
				upgrade_hovered: hoverData.upgrade_hovered,
				hover_timestamp: hoverData.hover_timestamp,
			} );
		}

		this.sendEventOrStore( 'TOP_UPGRADE', {
			currentStep: stepNumber,
			upgradeClicked: 'no_click',
			upgradeHovered: hoverData.upgrade_hovered,
			hoverTimestamp: hoverData.hover_timestamp,
		} );

		delete this.pendingHoverActions[ stepNumber ];
	}

	markUpgradeClickSent( stepNumber ) {
		if ( ! this.sentUpgradeClicks ) {
			this.sentUpgradeClicks = new Set();
		}
		this.sentUpgradeClicks.add( stepNumber );
	}

	hasUpgradeClickBeenSent( stepNumber ) {
		return this.sentUpgradeClicks && this.sentUpgradeClicks.has( stepNumber );
	}

	hasExistingUpgradeClickEvent( stepNumber ) {
		const config = this.EVENT_CONFIGS.TOP_UPGRADE;
		const storedEvents = StorageManager.getArray( config.storageKey );

		return storedEvents.some( ( event ) => {
			const eventStepNumber = this.getStepNumber( event.currentStep );
			return eventStepNumber === stepNumber &&
				event.upgradeClicked &&
				'no_click' !== event.upgradeClicked;
		} );
	}

	attachEventHandlersToButton( buttonElement, eventHandlers ) {
		const { handleMouseEnter, handleMouseLeave, handleClick } = eventHandlers;

		buttonElement._onboardingHandlers = {
			mouseenter: handleMouseEnter,
			mouseleave: handleMouseLeave,
			click: handleClick,
		};

		buttonElement.addEventListener( 'mouseenter', handleMouseEnter );
		buttonElement.addEventListener( 'mouseleave', handleMouseLeave );
		buttonElement.addEventListener( 'click', handleClick );
	}

	cleanupButtonTracking( buttonElement ) {
		if ( ! buttonElement ) {
			return;
		}

		this.removeExistingEventHandlers( buttonElement );
		this.clearTrackingDataAttributes( buttonElement );
	}

	removeExistingEventHandlers( buttonElement ) {
		if ( buttonElement._onboardingHandlers ) {
			const handlers = buttonElement._onboardingHandlers;
			buttonElement.removeEventListener( 'mouseenter', handlers.mouseenter );
			buttonElement.removeEventListener( 'mouseleave', handlers.mouseleave );
			buttonElement.removeEventListener( 'click', handlers.click );
			delete buttonElement._onboardingHandlers;
		}
	}

	clearTrackingDataAttributes( buttonElement ) {
		delete buttonElement.dataset.onboardingTracked;
		delete buttonElement.dataset.onboardingStep;
	}

	determineUpgradeClickedValue( buttonElement ) {
		if ( elementorCommon.config.library_connect?.is_connected &&
			'pro' === elementorCommon.config.library_connect?.current_access_tier ) {
			return 'already_pro_user';
		}

		if ( buttonElement.closest( '.e-app__popover' ) ||
			buttonElement.closest( '.elementor-tooltip' ) ||
			buttonElement.closest( '.e-onboarding__go-pro-content' ) ) {
			return 'on_tooltip';
		}

		if ( buttonElement.closest( '.eps-app__header' ) ) {
			return 'on_topbar';
		}

		return 'on_topbar';
	}

	trackExitAndSendEndState( currentStep ) {
		this.trackStepAction( currentStep, 'exit' );
		this.sendStepEndState( currentStep );
	}

	storeStep1EndStateForLater( eventData, storageKey ) {
		this.storeEventForLater( 'STEP1_END_STATE', eventData );
		StorageManager.remove( storageKey );
	}

	startSessionRecordingIfNeeded() {
		if ( StorageManager.exists( ONBOARDING_STORAGE_KEYS.SESSION_REPLAY_STARTED ) ) {
			return;
		}

		const featureFlagPromise = elementorCommon?.eventsManager?.featureFlagIsActive?.( 'core-onboarding-session-replays' );
		if ( ! featureFlagPromise ) {
			return;
		}

		StorageManager.setString( ONBOARDING_STORAGE_KEYS.SESSION_REPLAY_STARTED, 'true' );

		featureFlagPromise
			.then( ( isFeatureFlagActive ) => {
				if ( ! isFeatureFlagActive ) {
					return;
				}

				this.startSessionRecording();
			} )
			.catch( () => {} );
	}

	startSessionRecording() {
		if ( ! EventDispatcher.canSendEvents() ) {
			return;
		}

		if ( ! StorageManager.exists( ONBOARDING_STORAGE_KEYS.SESSION_REPLAY_STARTED ) ) {
			return;
		}

		elementorCommon.eventsManager?.startSessionRecording();
	}

	stopSessionRecordingIfNeeded() {
		if ( ! StorageManager.exists( ONBOARDING_STORAGE_KEYS.SESSION_REPLAY_STARTED ) ) {
			return;
		}

		elementorCommon.eventsManager?.stopSessionRecording();
	}

	onStepLoad( currentStep ) {
		const stepNumber = this.getStepNumber( currentStep );

		TimingManager.trackStepStartTime( stepNumber );

		if ( 1 === stepNumber || 'account' === currentStep ) {
			this.sendExperimentStarted( 101 );
		}

		if ( 2 === stepNumber || 'hello' === currentStep || 'hello_biz' === currentStep ) {
			this.startSessionRecordingIfNeeded();
			this.sendStoredStep1EventsOnStep2();
			this.sendExperimentStarted( 201 );
			this.sendExperimentStarted( 202 );
			this.sendStep2ThemesLoaded();
		}

		if ( 4 === stepNumber || 'goodToGo' === currentStep ) {
			this.checkAndSendReturnToStep4();
			this.sendExperimentStarted( 401 );
			this.sendExperimentStarted( 402 );
			this.sendStep4Loaded();
		}
	}

	sendStep2ThemesLoaded() {
		if ( StorageManager.exists( ONBOARDING_STORAGE_KEYS.STEP2_THEMES_LOADED_SENT ) ) {
			return;
		}

		if ( EventDispatcher.canSendEvents() ) {
			StorageManager.setString( ONBOARDING_STORAGE_KEYS.STEP2_THEMES_LOADED_SENT, 'true' );
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.STEP2_THEMES_LOADED,
				2,
				ONBOARDING_STEP_NAMES.HELLO_BIZ,
				{
					location: 'plugin_onboarding',
				},
			);
		}
	}

	sendThemeInstalled( theme ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.THEME_INSTALLED,
				2,
				ONBOARDING_STEP_NAMES.HELLO_BIZ,
				{
					location: 'plugin_onboarding',
					theme,
				},
			);
		}
	}

	sendThemeMarked( theme ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.THEME_MARKED,
				2,
				ONBOARDING_STEP_NAMES.HELLO_BIZ,
				{
					location: 'plugin_onboarding',
					theme,
				},
			);
		}
	}

	sendStep4Loaded() {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.STEP4_LOADED,
				4,
				ONBOARDING_STEP_NAMES.SITE_STARTER,
				{
					location: 'plugin_onboarding',
				},
			);
		}
	}

	sendStoredStep1EventsOnStep2() {
		this.sendStoredEvent( 'STEP1_CLICKED_CONNECT' );

		const step1Actions = StorageManager.getArray( ONBOARDING_STORAGE_KEYS.STEP1_ACTIONS );
		if ( step1Actions.length > 0 ) {
			this.sendHoverEventsFromStepActions( step1Actions, 1 );
		}

		this.sendStoredEvent( 'STEP1_END_STATE' );
		this.sendStoredEventsIfConnected();
	}

	setupPostOnboardingClickTracking() {
		return PostOnboardingTracker.setupPostOnboardingClickTracking();
	}

	cleanupPostOnboardingTracking() {
		return PostOnboardingTracker.cleanupPostOnboardingTracking();
	}

	clearAllOnboardingStorage() {
		return PostOnboardingTracker.clearAllOnboardingStorage();
	}

	getExperimentConfigs() {
		return {
			101: {
				name: 'core_onboarding_experiment101',
				enabledKey: 'isExperiment101Enabled',
				variantKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT101_VARIANT,
				startedKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT101_STARTED,
			},
			201: {
				name: 'core_onboarding_experiment201',
				enabledKey: 'isExperiment201Enabled',
				variantKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT201_VARIANT,
				startedKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT201_STARTED,
			},
			202: {
				name: 'core_onboarding_experiment202',
				enabledKey: 'isExperiment202Enabled',
				variantKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT202_VARIANT,
				startedKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT202_STARTED,
			},
			401: {
				name: 'core_onboarding_experiment401',
				enabledKey: 'isExperiment401Enabled',
				variantKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT401_VARIANT,
				startedKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT401_STARTED,
			},
			402: {
				name: 'core_onboarding_experiment402',
				enabledKey: 'isExperiment402Enabled',
				variantKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT402_VARIANT,
				startedKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT402_STARTED,
			},
		};
	}

	isExperimentEnabled( experimentId ) {
		const config = this.getExperimentConfigs()[ experimentId ];
		if ( ! config ) {
			return false;
		}
		return elementorAppConfig?.onboarding?.[ config.enabledKey ] || false;
	}

	getExperimentVariant( experimentId ) {
		const config = this.getExperimentConfigs()[ experimentId ];
		if ( ! config ) {
			return null;
		}
		return StorageManager.getString( config.variantKey ) || null;
	}

	assignExperimentVariant( experimentId ) {
		const config = this.getExperimentConfigs()[ experimentId ];
		if ( ! config || ! this.isExperimentEnabled( experimentId ) ) {
			return null;
		}

		const variant = Math.random() < 0.5 ? 'A' : 'B';
		StorageManager.setString( config.variantKey, variant );
		return variant;
	}

	sendExperimentStarted( experimentId ) {
		const config = this.getExperimentConfigs()[ experimentId ];
		if ( ! config ) {
			return;
		}

		if ( StorageManager.exists( config.startedKey ) ) {
			return;
		}

		let variant = this.getExperimentVariant( experimentId );

		if ( ! variant ) {
			variant = this.assignExperimentVariant( experimentId );
			if ( ! variant ) {
				return;
			}
		}

		const eventData = {
			'Experiment name': config.name,
			'Variant name': variant,
		};

		if ( EventDispatcher.canSendEvents() ) {
			EventDispatcher.dispatch( '$experiment_started', eventData );
			StorageManager.setString( config.startedKey, 'true' );
		} else {
			this.storeExperimentDataForLater( experimentId, eventData );
		}
	}

	storeExperimentDataForLater( experimentId, eventData ) {
		const config = this.getExperimentConfigs()[ experimentId ];
		if ( ! config ) {
			return;
		}

		const experimentEntry = {
			experimentId,
			eventData,
			timestamp: TimingManager.getCurrentTime(),
			startedKey: config.startedKey,
		};

		const existingExperiments = StorageManager.getArray( ONBOARDING_STORAGE_KEYS.PENDING_EXPERIMENT_DATA );
		existingExperiments.push( experimentEntry );
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_EXPERIMENT_DATA, existingExperiments );
	}

	sendStoredExperimentData() {
		const storedExperiments = StorageManager.getArray( ONBOARDING_STORAGE_KEYS.PENDING_EXPERIMENT_DATA );

		if ( 0 === storedExperiments.length ) {
			return;
		}

		storedExperiments.forEach( ( experiment ) => {
			EventDispatcher.dispatch( '$experiment_started', experiment.eventData );
			StorageManager.setString( experiment.startedKey, 'true' );
		} );

		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_EXPERIMENT_DATA );
	}
}

const onboardingTracker = new OnboardingTracker();

export default onboardingTracker;
export { ONBOARDING_STORAGE_KEYS, ONBOARDING_STEP_NAMES };
