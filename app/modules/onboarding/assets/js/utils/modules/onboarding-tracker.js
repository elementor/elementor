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
					trigger: 'skip_clicked',
				},
				payloadBuilder: ( eventData ) => ( {
					action_step: eventData.currentStep,
					skip_timestamp: eventData.timestamp,
				} ),
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
					create_account_clicked: eventData.createAccountClicked,
				} ),
			},
			CREATE_ACCOUNT_STATUS: {
				eventName: ONBOARDING_EVENTS_MAP.CREATE_ACCOUNT_STATUS,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: 'create_flow_returns_status',
				},
				payloadBuilder: ( eventData ) => ( {
					onboarding_create_account_status: eventData.status,
				} ),
			},
			CONNECT_STATUS: {
				eventName: ONBOARDING_EVENTS_MAP.CONNECT_STATUS,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS,
				basePayload: {
					location: 'plugin_onboarding',
					trigger: 'connect_flow_returns_status',
				},
				payloadBuilder: ( eventData ) => ( {
					onboarding_connect_status: eventData.status,
					tracking_opted_in: eventData.trackingOptedIn,
					user_tier: eventData.userTier,
				} ),
				stepOverride: 1,
				stepNameOverride: ONBOARDING_STEP_NAMES.CONNECT,
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
			},
			STEP1_END_STATE: {
				eventName: ONBOARDING_EVENTS_MAP.STEP1_END_STATE,
				storageKey: ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE,
				isRawPayload: true,
				payloadBuilder: ( eventData ) => eventData,
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

	sendEventOrStore( eventType, eventData ) {
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
				trigger: eventsConfig.triggers.click,
				pro_features_checked: proFeaturesChecked,
			},
		);
	}

	extractSelectedFeatureKeys( selectedFeatures ) {
		if ( ! selectedFeatures || ! Array.isArray( selectedFeatures ) ) {
			return [];
		}

		return selectedFeatures
			.filter( ( feature ) => feature && feature.is_checked )
			.map( ( feature ) => feature.key )
			.filter( ( key ) => key );
	}

	sendHelloBizContinue( stepNumber ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.HELLO_BIZ_CONTINUE,
				stepNumber,
				ONBOARDING_STEP_NAMES.HELLO_BIZ,
				{
					location: 'plugin_onboarding',
					trigger: eventsConfig.triggers.click,
				},
			);
		}
	}

	sendTopUpgrade( currentStep, upgradeClicked ) {
		return this.sendEventOrStore( 'TOP_UPGRADE', { currentStep, upgradeClicked } );
	}

	cancelDelayedNoClickEvent() {
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK );
	}

	initiateCoreOnboarding() {
		TimingManager.clearStaleSessionData();
		TimingManager.initializeOnboardingStartTime();
	}

	sendCoreOnboardingInitiated() {
		const startTime = TimingManager.initializeOnboardingStartTime();
		const currentTime = TimingManager.getCurrentTime();
		const totalOnboardingTime = Math.round( ( currentTime - startTime ) / 1000 );

		const eventData = TimingManager.addTimingToEventData( {
			location: 'plugin_onboarding',
			trigger: 'core_onboarding_initiated',
			step_number: 1,
			step_name: ONBOARDING_STEP_NAMES.ONBOARDING_START,
			onboarding_start_time: startTime,
			total_onboarding_time_seconds: totalOnboardingTime,
		} );

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.CORE_ONBOARDING, eventData );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.INITIATED );
	}

	storeSiteStarterChoice( siteStarter ) {
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

		if ( ! choiceData.return_event_sent ) {
			const returnEventPayload = EventDispatcher.createStepEventPayload(
				4,
				ONBOARDING_STEP_NAMES.SITE_STARTER,
				{
					location: 'plugin_onboarding',
					trigger: 'user_returns_to_onboarding',
					return_to_onboarding: choiceData.site_starter,
					original_choice_timestamp: choiceData.timestamp,
				},
			);

			this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP4_RETURN_STEP4, returnEventPayload );

			choiceData.return_event_sent = true;
			StorageManager.setObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, choiceData );
		}
	}

	handleSiteStarterChoice( siteStarter ) {
		TimingManager.trackStepStartTime( 4 );
		this.storeSiteStarterChoice( siteStarter );
		this.trackStepAction( 4, 'site_starter', {
			source_type: siteStarter,
		} );
		this.sendStepEndState( 4 );
	}

	storeExitEventForLater( exitType, currentStep ) {
		const exitData = {
			exitType,
			currentStep,
			timestamp: TimingManager.getCurrentTime(),
		};
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_EXIT, exitData );
	}

	checkAndSendEditorLoadedFromOnboarding() {
		return PostOnboardingTracker.checkAndSendEditorLoadedFromOnboarding();
	}

	sendExitButtonEvent( currentStep ) {
		const eventData = EventDispatcher.createStepEventPayload(
			currentStep,
			this.getStepName( currentStep ),
			{
				location: 'plugin_onboarding',
				trigger: 'exit_button_clicked',
				action_step: currentStep,
			},
		);

		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.EXIT_BUTTON, eventData );
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
		// Always store the action, regardless of global timing availability
		const existingActions = StorageManager.getArray( storageKey );
		const actionData = { action, timestamp: TimingManager.getCurrentTime(), ...additionalData };

		existingActions.push( actionData );
		StorageManager.setObject( storageKey, existingActions );
	}

	sendStepEndStateInternal( stepNumber, storageKey, eventName, stepName, endStateProperty ) {
		const actions = StorageManager.getArray( storageKey );
		if ( 0 === actions.length ) {
			return;
		}

		this.sendHoverEventsFromStepActions( actions, stepNumber );

		let eventData = EventDispatcher.createStepEventPayload( stepNumber, stepName, {
			location: 'plugin_onboarding',
			trigger: 'user_redirects_out_of_step',
		} );

		eventData = TimingManager.addTimingToEventData( eventData, stepNumber );
		const filteredActions = actions.filter( ( action ) => 'upgrade_hover' !== action.action );
		eventData[ endStateProperty ] = filteredActions;

		if ( EventDispatcher.canSendEvents() ) {
			this.dispatchEvent( eventName, eventData );
			StorageManager.remove( storageKey );
			TimingManager.clearStepStartTime( stepNumber );
		} else if ( 1 === stepNumber ) {
			this.storeStep1EndStateForLater( eventData, storageKey );
		} else {
			this.dispatchEvent( eventName, eventData );
			StorageManager.remove( storageKey );
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

	sendAppropriateStatusEvent( status, data = null ) {
		const hasCreateAccountAction = StorageManager.exists( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );
		const hasConnectAction = StorageManager.exists( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT );

		if ( hasCreateAccountAction ) {
			this.sendEventDirect( 'CREATE_ACCOUNT_STATUS', { status, currentStep: 1 } );
		} else if ( hasConnectAction ) {
			if ( data ) {
				this.sendEventDirect( 'CONNECT_STATUS', { status, trackingOptedIn: data.tracking_opted_in, userTier: data.access_tier } );
			} else {
				this.sendEventDirect( 'CONNECT_STATUS', { status, trackingOptedIn: false, userTier: null } );
			}
		} else if ( data ) {
			this.sendEventDirect( 'CONNECT_STATUS', { status, trackingOptedIn: data.tracking_opted_in, userTier: data.access_tier } );
		} else {
			this.sendEventDirect( 'CONNECT_STATUS', { status, trackingOptedIn: false, userTier: null } );
		}
	}

	sendAllStoredEvents() {
		this.sendStoredEvent( 'SKIP' );
		this.sendStoredEvent( 'TOP_UPGRADE' );
		this.sendStoredEvent( 'CREATE_MY_ACCOUNT' );
		this.sendStoredEvent( 'CREATE_ACCOUNT_STATUS' );
		this.sendStoredEvent( 'CONNECT_STATUS' );
		this.sendStoredEvent( 'STEP1_CLICKED_CONNECT' );
		this.sendStoredEvent( 'STEP1_END_STATE' );
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
		this.sendEventOrStore( 'TOP_UPGRADE', { currentStep, upgradeClicked: upgradeClickedValue } );
	}

	trackUpgradeHoverAction( currentStep, buttonElement ) {
		const stepNumber = this.getStepNumber( currentStep );
		if ( ! stepNumber ) {
			return;
		}

		const upgradeHoverValue = this.determineUpgradeClickedValue( buttonElement );

		this.trackStepAction( stepNumber, 'upgrade_hover', {
			upgrade_hovered: upgradeHoverValue,
			hover_timestamp: TimingManager.getCurrentTime(),
		} );
	}

	sendHoverEventsFromStepActions( actions, stepNumber ) {
		const hoverActions = actions.filter( ( action ) => 'upgrade_hover' === action.action );

		if ( 0 === hoverActions.length ) {
			return;
		}

		const hasClickEvent = this.hasExistingUpgradeClickEvent( stepNumber );
		if ( hasClickEvent ) {
			return;
		}

		hoverActions.forEach( ( hoverAction ) => {
			this.sendEventOrStore( 'TOP_UPGRADE', {
				currentStep: stepNumber,
				upgradeClicked: 'no_click',
				upgradeHovered: hoverAction.upgrade_hovered,
				hoverTimestamp: hoverAction.hover_timestamp,
			} );
		} );
	}

	hasExistingUpgradeClickEvent( stepNumber ) {
		const config = this.EVENT_CONFIGS.TOP_UPGRADE;
		const storedEvents = StorageManager.getArray( config.storageKey );

		return storedEvents.some( ( event ) =>
			event.currentStep === stepNumber &&
			event.upgradeClicked &&
			'no_click' !== event.upgradeClicked,
		);
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

	onStepLoad( currentStep ) {
		TimingManager.trackStepStartTime( this.getStepNumber( currentStep ) );

		if ( 2 === this.getStepNumber( currentStep ) || 'hello' === currentStep || 'hello_biz' === currentStep ) {
			this.sendStoredStep1EventsOnStep2();
		}

		if ( 4 === this.getStepNumber( currentStep ) || 'goodToGo' === currentStep ) {
			this.checkAndSendReturnToStep4();
		}
	}

	sendStoredStep1EventsOnStep2() {
		this.sendStoredEvent( 'STEP1_CLICKED_CONNECT' );
		this.sendStoredEvent( 'STEP1_END_STATE' );
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
}

const onboardingTracker = new OnboardingTracker();

export default onboardingTracker;
export { ONBOARDING_STORAGE_KEYS, ONBOARDING_STEP_NAMES };
