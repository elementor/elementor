import eventsConfig from '../../../../../../../core/common/modules/events-manager/assets/js/events-config';
import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';
import EventDispatcher, { ONBOARDING_EVENTS_MAP, ONBOARDING_STEP_NAMES } from './event-dispatcher.js';
import TimingManager from './timing-manager.js';

class OnboardingTracker {
	constructor() {
		this.initializeEventListeners();
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

	sendConnectStatus( status, trackingOptedIn = false, userTier = null ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.CONNECT_STATUS,
				1,
				ONBOARDING_STEP_NAMES.CONNECT,
				{
					location: 'plugin_onboarding',
					trigger: 'connect_flow_returns_status',
					onboarding_connect_status: status,
					tracking_opted_in: trackingOptedIn,
					user_tier: userTier,
				},
			);
		}
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

	getSiteStarterChoice() {
		return StorageManager.getObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
	}

	clearSiteStarterChoice() {
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
	}

	handleSiteStarterChoice( siteStarter ) {
		this.trackStepStartTime( 4 );
		this.storeSiteStarterChoice( siteStarter );
		this.trackStepAction( 4, 'site_starter', {
			site_starter: siteStarter,
		} );
		this.sendStepEndState( 4 );
	}

	sendOnboardingSkip( currentStep ) {
		if ( EventDispatcher.canSendEvents() ) {
			return this.sendSkipEvent( currentStep );
		}
		this.storeSkipEventForLater( currentStep );
	}

	storeExitEventForLater( exitType, currentStep ) {
		const exitData = {
			exitType,
			currentStep,
			timestamp: TimingManager.getCurrentTime(),
		};
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_EXIT, exitData );
	}

	clearStaleSessionData() {
		TimingManager.clearStaleSessionData();
	}

	checkAndSendEditorLoadedFromOnboarding() {
		const alreadyTracked = StorageManager.exists( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED );
		if ( alreadyTracked ) {
			return;
		}

		const choiceData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		const siteStarterChoice = choiceData?.site_starter;

		if ( siteStarterChoice ) {
			const canDispatch = EventDispatcher.canSendEvents();
			if ( canDispatch ) {
				EventDispatcher.dispatchEditorEvent( ONBOARDING_EVENTS_MAP.EDITOR_LOADED_FROM_ONBOARDING, {
					editor_loaded_from_onboarding_source: siteStarterChoice,
				} );
			}

			StorageManager.setString( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED, 'true' );
		}
	}

	storeSkipEventForLater( currentStep ) {
		const skipData = {
			currentStep,
			timestamp: TimingManager.getCurrentTime(),
		};
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_SKIP, skipData );
	}

	sendStoredSkipEvent() {
		const skipData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.PENDING_SKIP );
		if ( ! skipData ) {
			return;
		}

		const stepName = this.getStepName( skipData.currentStep );
		const eventData = EventDispatcher.createStepEventPayload(
			skipData.currentStep,
			stepName,
			{
				location: 'plugin_onboarding',
				trigger: 'skip_clicked',
				action_step: stepName,
				skip_timestamp: skipData.timestamp,
			},
		);

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.SKIP, eventData );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_SKIP );
	}

	sendSkipEvent( currentStep ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.SKIP,
				currentStep,
				this.getStepName( currentStep ),
				{
					location: 'plugin_onboarding',
					trigger: 'skip_clicked',
					action_step: currentStep,
				},
			);
		}
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

	sendTopUpgrade( currentStep, upgradeClicked ) {
		const canSendEvents = EventDispatcher.canSendEvents();

		if ( canSendEvents ) {
			const eventData = EventDispatcher.createStepEventPayload(
				currentStep,
				this.getStepName( currentStep ),
				{
					location: 'plugin_onboarding',
					trigger: 'upgrade_interaction',
					action_step: currentStep,
					upgrade_clicked: upgradeClicked,
				},
			);

			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.TOP_UPGRADE, eventData );
		}
	}

	sendCreateMyAccount( currentStep, createAccountClicked ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.CREATE_MY_ACCOUNT,
				currentStep,
				this.getStepName( currentStep ),
				{
					location: 'plugin_onboarding',
					trigger: 'upgrade_interaction',
					action_step: currentStep,
					create_account_clicked: createAccountClicked,
				},
			);
		}
	}

	sendCreateAccountStatus( status, currentStep ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.CREATE_ACCOUNT_STATUS,
				currentStep,
				this.getStepName( currentStep ),
				{
					location: 'plugin_onboarding',
					trigger: 'create_flow_returns_status',
					onboarding_create_account_status: status,
				},
			);
		}
	}

	sendStep1ClickedConnect( currentStep ) {
		if ( EventDispatcher.canSendEvents() ) {
			return EventDispatcher.dispatchStepEvent(
				ONBOARDING_EVENTS_MAP.STEP1_CLICKED_CONNECT,
				currentStep,
				this.getStepName( currentStep ),
				{
					location: 'plugin_onboarding',
					trigger: eventsConfig.triggers.click,
				},
			);
		}
	}

	storeTopUpgradeEventForLater( currentStep, upgradeClicked ) {
		if ( ! currentStep || ! upgradeClicked ) {
			return;
		}

		const existingEvents = StorageManager.getArray( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
		const eventData = {
			currentStep,
			upgradeClicked,
			timestamp: TimingManager.getCurrentTime(),
		};

		existingEvents.push( eventData );
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE, existingEvents );
	}

	sendStoredTopUpgradeEvent() {
		const storedEvents = StorageManager.getArray( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
		if ( 0 === storedEvents.length ) {
			return;
		}

		storedEvents.forEach( ( eventData ) => {
			const eventPayload = EventDispatcher.createStepEventPayload(
				eventData.currentStep,
				this.getStepName( eventData.currentStep ),
				{
					location: 'plugin_onboarding',
					trigger: 'upgrade_interaction',
					action_step: eventData.currentStep,
					upgrade_clicked: eventData.upgradeClicked,
				},
			);

			this.dispatchEvent( ONBOARDING_EVENTS_MAP.TOP_UPGRADE, eventPayload );
		} );

		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
	}

	trackStepAction( stepNumber, action ) {
		const stepConfig = this.getStepConfig( stepNumber );
		if ( stepConfig ) {
			this.trackStepActionInternal( stepNumber, action, stepConfig.storageKey );
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
		const timeData = TimingManager.calculateTotalTimeSpent();
		if ( ! timeData ) {
			return;
		}

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

		let eventData = EventDispatcher.createStepEventPayload( stepNumber, stepName, {
			location: 'plugin_onboarding',
			trigger: 'user_redirects_out_of_step',
		} );

		eventData = TimingManager.addTimingToEventData( eventData, stepNumber );
		eventData[ endStateProperty ] = actions;

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

	calculateTimeSpent() {
		return TimingManager.calculateTotalTimeSpent();
	}

	trackStepStartTime( stepNumber ) {
		return TimingManager.trackStepStartTime( stepNumber );
	}

	calculateStepTimeSpent( stepNumber ) {
		return TimingManager.calculateStepTimeSpent( stepNumber );
	}

	clearStepStartTime( stepNumber ) {
		TimingManager.clearStepStartTime( stepNumber );
	}

	getStoredActions( storageKey ) {
		return StorageManager.getArray( storageKey );
	}

	getStepNumber( pageId ) {
		if ( 'number' === typeof pageId ) {
			return pageId;
		}

		const stepMappings = {
			account: 1,
			connect: 1,
			hello_biz: 2,
			pro_features: 3,
			site_starter: 4,
			goodToGo: 4,
		};

		const mappedStep = stepMappings[ pageId ];
		return mappedStep || null;
	}

	getStepName( stepNumber ) {
		const stepNames = {
			1: ONBOARDING_STEP_NAMES.CONNECT,
			2: ONBOARDING_STEP_NAMES.HELLO_BIZ,
			3: ONBOARDING_STEP_NAMES.PRO_FEATURES,
			4: ONBOARDING_STEP_NAMES.SITE_STARTER,
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
			this.sendCreateAccountStatus( status, 1 );
		} else if ( hasConnectAction ) {
			if ( data ) {
				this.sendConnectStatus( status, data.tracking_opted_in, data.access_tier );
			} else {
				this.sendConnectStatus( status, false, null );
			}
		} else if ( data ) {
			this.sendConnectStatus( status, data.tracking_opted_in, data.access_tier );
		} else {
			this.sendConnectStatus( status, false, null );
		}
	}

	sendAllStoredEvents() {
		this.sendStoredSkipEvent();
		this.sendStoredTopUpgradeEvent();
		this.sendStoredCreateMyAccountEvent();
		this.sendStoredCreateAccountStatusEvent();
		this.sendStoredConnectStatusEvent();
		this.sendStoredStep1ClickedConnectEvent();
		this.sendStoredStep1EndStateEvent();
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
		if ( ! buttonElement || buttonElement.dataset.onboardingTracked ) {
			return null;
		}

		buttonElement.dataset.onboardingTracked = 'true';

		let hasClicked = false;

		const handleMouseEnter = () => {
			this.scheduleDelayedNoClickEvent( currentStep );
		};

		const handleMouseLeave = () => {
			if ( ! hasClicked ) {
				this.cancelDelayedNoClickEvent();
			}
		};

		const handleClick = () => {
			hasClicked = true;
			this.cancelDelayedNoClickEvent();

			const upgradeClickedValue = this.determineUpgradeClickedValue( buttonElement );
			this.sendTopUpgrade( currentStep, upgradeClickedValue );
		};

		buttonElement.addEventListener( 'mouseenter', handleMouseEnter );
		buttonElement.addEventListener( 'mouseleave', handleMouseLeave );
		buttonElement.addEventListener( 'click', handleClick );

		return () => {
			buttonElement.removeEventListener( 'mouseenter', handleMouseEnter );
			buttonElement.removeEventListener( 'mouseleave', handleMouseLeave );
			buttonElement.removeEventListener( 'click', handleClick );
		};
	}

	determineUpgradeClickedValue( buttonElement ) {
		if ( elementorCommon.config.library_connect?.is_connected &&
			'pro' === elementorCommon.config.library_connect?.current_access_tier ) {
			return 'already_pro_user';
		}

		if ( buttonElement.closest( '.elementor-tooltip' ) ) {
			return 'on_tooltip';
		}

		if ( buttonElement.closest( '.eps-app__header' ) ) {
			return 'on_topbar';
		}

		return 'on_topbar';
	}

	setupTopUpgradeTracking( currentStep ) {
		return this.setupAllUpgradeButtons( currentStep );
	}

	setupSingleUpgradeButtonTracking( buttonElement, currentStep ) {
		return this.setupSingleUpgradeButton( buttonElement, currentStep );
	}

	trackExitAndSendEndState( currentStep ) {
		this.trackStepAction( currentStep, 'exit' );
		this.sendStepEndState( currentStep );
	}

	scheduleDelayedNoClickEvent( currentStep, delay = 500 ) {
		this.cancelDelayedNoClickEvent();

		const eventData = {
			currentStep,
			scheduledTime: TimingManager.getCurrentTime() + delay,
		};

		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK, eventData );
	}

	cancelDelayedNoClickEvent() {
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK );
	}

	sendDelayedNoClickEvent() {
		const eventData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK );
		if ( ! eventData ) {
			return;
		}

		this.sendTopUpgrade( eventData.currentStep, 'no_click' );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK );
	}

	storeCreateMyAccountEventForLater( currentStep, createAccountClicked ) {
		const eventData = {
			currentStep,
			createAccountClicked,
			timestamp: TimingManager.getCurrentTime(),
		};
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT, eventData );
	}

	sendStoredCreateMyAccountEvent() {
		const eventData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );
		if ( ! eventData ) {
			return;
		}

		const eventPayload = EventDispatcher.createStepEventPayload(
			eventData.currentStep,
			this.getStepName( eventData.currentStep ),
			{
				location: 'plugin_onboarding',
				trigger: 'upgrade_interaction',
				action_step: eventData.currentStep,
				create_account_clicked: eventData.createAccountClicked,
			},
		);

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_MY_ACCOUNT, eventPayload );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );
	}

	storeCreateAccountStatusEventForLater( status, currentStep ) {
		const eventData = {
			status,
			currentStep,
			timestamp: TimingManager.getCurrentTime(),
		};
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS, eventData );
	}

	sendStoredCreateAccountStatusEvent() {
		const eventData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS );
		if ( ! eventData ) {
			return;
		}

		const eventPayload = EventDispatcher.createStepEventPayload(
			eventData.currentStep,
			this.getStepName( eventData.currentStep ),
			{
				location: 'plugin_onboarding',
				trigger: 'create_flow_returns_status',
				onboarding_create_account_status: eventData.status,
			},
		);

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_ACCOUNT_STATUS, eventPayload );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS );
	}

	storeConnectStatusEventForLater( status, trackingOptedIn, userTier ) {
		const eventData = {
			status,
			trackingOptedIn,
			userTier,
			timestamp: TimingManager.getCurrentTime(),
		};
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS, eventData );
	}

	sendStoredConnectStatusEvent() {
		const eventData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS );
		if ( ! eventData ) {
			return;
		}

		const eventPayload = EventDispatcher.createStepEventPayload(
			1,
			ONBOARDING_STEP_NAMES.CONNECT,
			{
				location: 'plugin_onboarding',
				trigger: 'connect_flow_returns_status',
				onboarding_connect_status: eventData.status,
				tracking_opted_in: eventData.trackingOptedIn,
				user_tier: eventData.userTier,
			},
		);

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.CONNECT_STATUS, eventPayload );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS );
	}

	storeStep1ClickedConnectEventForLater( currentStep ) {
		const eventData = {
			currentStep,
			timestamp: TimingManager.getCurrentTime(),
		};
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT, eventData );
	}

	storeStep1EndStateForLater( eventData, storageKey ) {
		const storedEventData = {
			...eventData,
			timestamp: TimingManager.getCurrentTime(),
		};
		StorageManager.setObject( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE, storedEventData );
		StorageManager.remove( storageKey );
	}

	sendStoredStep1ClickedConnectEvent() {
		const eventData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT );
		if ( ! eventData ) {
			return;
		}

		const eventPayload = EventDispatcher.createStepEventPayload(
			eventData.currentStep,
			this.getStepName( eventData.currentStep ),
			{
				location: 'plugin_onboarding',
				trigger: eventsConfig.triggers.click,
			},
		);

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP1_CLICKED_CONNECT, eventPayload );
		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT );
	}

	sendStoredStep1EndStateEvent() {
		const eventData = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE );
		if ( ! eventData ) {
			return;
		}

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP1_END_STATE, {
			...eventData,
		} );

		StorageManager.remove( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE );
	}

	onStepLoad( currentStep ) {
		this.trackStepStartTime( this.getStepNumber( currentStep ) );

		if ( 2 === this.getStepNumber( currentStep ) || 'hello_biz' === currentStep ) {
			this.sendStoredStep1EventsOnStep2();
		}

		if ( 4 === this.getStepNumber( currentStep ) || 'goodToGo' === currentStep ) {
			this.checkAndSendReturnToStep4();
		}
	}

	sendStoredStep1EventsOnStep2() {
		this.sendStoredStep1ClickedConnectEvent();
		this.sendStoredStep1EndStateEvent();
	}

	silentlyIgnoreStorageErrors() {
	}
}

const onboardingTracker = new OnboardingTracker();

export default onboardingTracker;
export { ONBOARDING_STORAGE_KEYS, ONBOARDING_STEP_NAMES };
