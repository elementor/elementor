import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';
import EventDispatcher, { ONBOARDING_STEP_NAMES } from './event-dispatcher.js';
import {
	ONBOARDING_EVENTS,
	STEP_TARGET_NAMES,
	stepLocationL1,
} from './onboarding-event-names.js';
import { clearEventQueue } from './event-queue.js';
import TimingManager from './timing-manager.js';
import PostOnboardingTracker from './post-onboarding-tracker.js';

class OnboardingTracker {
	#hasAttemptedSessionRecording = false;

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
		this.setupSessionRecordingCleanup();
	}

	setupSessionRecordingCleanup() {
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

	sendEventOrStore( eventType, eventData ) {
		switch ( eventType ) {
			case 'SKIP':
				this.trackSkipClicked( eventData.currentStep );
				break;
			case 'TOP_UPGRADE':
				if ( 'no_click' === eventData.upgradeClicked || 'already_pro_user' === eventData.upgradeClicked ) {
					return;
				}
				this.trackUpgradeClicked( eventData.currentStep, eventData.upgradeClicked );
				break;
			case 'CREATE_MY_ACCOUNT':
				this.markCreateAccountFlow( eventData.createAccountClicked );
				this.trackLoginType(
					eventData.currentStep,
					'create_account',
					'topbar' === eventData.createAccountClicked ? 'header' : 'login_step',
				);
				break;
			case 'STEP1_CLICKED_CONNECT':
				this.trackLoginType( eventData.currentStep, 'connect', 'login_step' );
				break;
			case 'AB_101_START_AS_FREE_USER':
				this.trackLoginType( eventData.currentStep, 'guest', 'login_step' );
				break;
			case 'EXIT':
				this.trackExitClicked( eventData.currentStep );
				break;
			default:
				break;
		}
	}

	markCreateAccountFlow( createAccountClicked ) {
		StorageManager.setString(
			ONBOARDING_STORAGE_KEYS.CREATE_ACCOUNT_FLOW,
			this.validateCreateAccountClicked( createAccountClicked ),
		);
	}

	trackInitialized() {
		EventDispatcher.trackEvent(
			ONBOARDING_EVENTS.INITIALIZED,
			{
				interaction_type: 'load',
				target_type: 'loaded',
				target_name: 'onboarding_first_load',
				interaction_result: 'onboarding_loaded',
				target_location: 'onboarding',
				interaction_description: 'first step of the onboarding funnel',
			},
			'core_onboarding_initialized',
		);
	}

	hasResumeProgress() {
		if ( ! TimingManager.hasOnboardingStarted() ) {
			return false;
		}

		for ( let stepNumber = 1; stepNumber <= 4; stepNumber++ ) {
			const stepConfig = this.getStepConfig( stepNumber );
			if ( stepConfig && StorageManager.getArray( stepConfig.storageKey ).length > 0 ) {
				return true;
			}

			if ( StorageManager.getStepStartTime( stepNumber ) ) {
				return true;
			}
		}

		return StorageManager.exists( ONBOARDING_STORAGE_KEYS.STEP1_END_STATE_SENT );
	}

	getResumeStepNumber() {
		for ( let stepNumber = 4; stepNumber >= 1; stepNumber-- ) {
			if ( StorageManager.getStepStartTime( stepNumber ) ) {
				return stepNumber;
			}
		}

		return 1;
	}

	trackResume( stepNumber ) {
		EventDispatcher.trackEvent(
			ONBOARDING_EVENTS.RESUME,
			{
				interaction_type: 'onboarding_load',
				target_type: 'reloaded',
				target_name: 'reloaded',
				interaction_result: 'onboarding_load',
				target_value: stepLocationL1( stepNumber ),
				target_location: 'onboarding',
				location_l1: stepLocationL1( stepNumber ),
				interaction_description: 'onboarding step loaded',
			},
			'core_onboarding_resume',
		);
	}

	trackStepViewed( stepNumber ) {
		if ( ! stepNumber || stepNumber > 4 ) {
			return;
		}

		EventDispatcher.trackEvent(
			ONBOARDING_EVENTS.STEP_VIEWED,
			{
				interaction_type: 'step_load',
				target_type: 'loaded',
				target_name: STEP_TARGET_NAMES[ stepNumber ],
				interaction_result: 'step_load',
				target_value: stepLocationL1( stepNumber ),
				target_location: 'onboarding',
				location_l1: stepLocationL1( stepNumber ),
				interaction_description: 'onboarding step loaded',
			},
			`step_viewed_${ stepNumber }`,
		);
	}

	trackLoginType( currentStep, loginType, locationL2 ) {
		const stepNumber = this.getStepNumber( currentStep ) || 1;

		EventDispatcher.trackEvent( ONBOARDING_EVENTS.LOGIN_TYPE, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'login',
			interaction_result: 'guest' === loginType ? 'skip_and_onboarding_initialization' : 'login_option selected',
			target_value: loginType,
			target_location: 'onboarding',
			location_l1: 'login_step',
			location_l2: locationL2,
			interaction_description: 'user connect process loaded from onboarding',
		} );

		this.trackStepAction( stepNumber, `login_type:${ loginType }`, { location_l2: locationL2 } );
	}

	trackConnect( status, data = null, errorMessage = null ) {
		const isCreateAccount = StorageManager.exists( ONBOARDING_STORAGE_KEYS.CREATE_ACCOUNT_FLOW );
		const targetName = isCreateAccount ? 'create_account' : 'connect';
		const success = 'success' === status;
		const metadata = {
			tracking_opted_in: data?.tracking_opted_in || false,
			user_tier: data?.access_tier || null,
		};

		if ( ! success && errorMessage ) {
			metadata.error = errorMessage;
		}

		EventDispatcher.trackEvent( ONBOARDING_EVENTS.CONNECT, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: targetName,
			interaction_result: 'user_connect',
			target_value: success,
			target_location: 'onboarding',
			location_l1: 'connect_flow',
			interaction_description: 'user connect process loaded from onboarding',
			metadata,
		} );

		if ( ! success ) {
			this.trackErrorReported( 1, 'request', targetName, errorMessage || 'connect_failed' );
		}

		if ( success ) {
			StorageManager.remove( ONBOARDING_STORAGE_KEYS.CREATE_ACCOUNT_FLOW );
		}
	}

	trackSkipClicked( currentStep ) {
		const stepNumber = this.getStepNumber( currentStep );

		EventDispatcher.trackEvent( ONBOARDING_EVENTS.SKIP_CLICKED, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'skip',
			interaction_result: 'skip_step',
			target_value: stepLocationL1( stepNumber ),
			target_location: 'onboarding_navigation',
			location_l1: 'footer',
			location_l2: stepLocationL1( stepNumber ),
		} );
	}

	trackBackClicked( currentStep ) {
		const stepNumber = this.getStepNumber( currentStep );

		EventDispatcher.trackEvent( ONBOARDING_EVENTS.BACK_CLICKED, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'back',
			interaction_result: 'redirect_back',
			target_value: stepLocationL1( stepNumber ),
			target_location: 'onboarding_navigation',
			location_l1: 'footer',
			location_l2: stepLocationL1( stepNumber ),
		} );
	}

	trackUpgradeClicked( currentStep, upgradeClicked ) {
		const stepNumber = this.getStepNumber( currentStep );
		const locationL2 = 'on_tooltip' === upgradeClicked ? 'tooltip' : 'header';

		EventDispatcher.trackEvent( ONBOARDING_EVENTS.UPGRADE_CLICKED, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'upgrade',
			interaction_result: 'pricing_page_opened',
			target_value: stepLocationL1( stepNumber ),
			target_location: 'onboarding_navigation',
			location_l1: locationL2,
			location_l2: stepLocationL1( stepNumber ),
		} );
	}

	trackExitClicked( currentStep ) {
		const stepNumber = this.getStepNumber( currentStep );

		EventDispatcher.trackEvent( ONBOARDING_EVENTS.EXIT_CLICKED, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'exit',
			interaction_result: 'exit_onboarding',
			target_value: stepLocationL1( stepNumber ),
			target_location: 'onboarding_navigation',
			location_l1: 'header',
			location_l2: stepLocationL1( stepNumber ),
		} );

		this.trackOnboardingSummary( stepNumber );
		clearEventQueue();
	}

	trackThemeSelected( theme, interactionResult ) {
		EventDispatcher.trackEvent( ONBOARDING_EVENTS.THEME_SELECTED, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'continue_with_hello',
			interaction_result: interactionResult,
			target_value: theme,
			target_location: 'onboarding',
			location_l1: '2',
			location_l2: '2',
			interaction_description: 'user installed a certain theme',
		} );
	}

	trackThemeUnselected() {
		EventDispatcher.trackEvent( ONBOARDING_EVENTS.THEME_UNSELECTED, {
			interaction_type: 'click',
			target_type: 'button',
			target_name: 'hello_theme',
			interaction_result: 'theme_install_skipped',
			target_value: 'hello_theme',
			target_location: 'onboarding',
			location_l1: '2',
			location_l2: '2',
			interaction_description: 'user unselected hello theme box and continued',
		} );
	}

	trackProFeaturesSelected( selectedFeatures, openedPricing ) {
		const featureKeys = this.extractSelectedFeatureKeys( selectedFeatures );

		EventDispatcher.trackEvent( ONBOARDING_EVENTS.PRO_FEATURES_SELECTED, {
			interaction_type: 'click',
			target_type: 'cards',
			target_name: openedPricing ? 'upgrade_now' : 'skip',
			interaction_result: openedPricing ? 'pricing_page' : 'step_skipped',
			target_value: featureKeys,
			target_location: 'onboarding',
			location_l1: '3',
			location_l2: '3',
			interaction_description: 'user selected pro features and continued',
		} );
	}

	trackSiteStarterSelected( siteStarter ) {
		EventDispatcher.trackEvent( ONBOARDING_EVENTS.SITE_STARTER_SELECTED, {
			interaction_type: 'click',
			target_type: 'card',
			target_name: siteStarter,
			interaction_result: 'site_starter_selected',
			target_value: siteStarter,
			target_location: 'onboarding',
			location_l1: '4',
			location_l2: '4',
		} );
	}

	trackErrorReported( stepNumber, targetType, targetName, errorBody ) {
		EventDispatcher.trackEvent( ONBOARDING_EVENTS.ERROR_REPORTED, {
			interaction_type: 'action_failed',
			target_type: targetType,
			target_name: targetName,
			interaction_result: 'error_reported',
			target_value: stepLocationL1( stepNumber ),
			target_location: 'onboarding',
			location_l1: stepLocationL1( stepNumber ),
			interaction_description: 'onboarding step loaded',
			metadata: { error_title: errorBody },
		} );
	}

	trackOnboardingSummary( lastStepNumber = 4 ) {
		const metadata = {
			summary: this.buildSummaryMetadata(),
		};

		EventDispatcher.trackEvent(
			ONBOARDING_EVENTS.SUMMARY,
			{
				interaction_type: 'onboarding_complete',
				target_type: 'summary',
				target_name: 'ob_summary',
				interaction_result: 'onboarding_final_choices',
				target_location: 'onboarding',
				location_l1: 'summary',
				location_l2: stepLocationL1( lastStepNumber ),
				interaction_description: 'trigger event upon onboarding completion or when flow is closed abruptly',
				metadata,
			},
			'core_onboarding_summary',
		);
	}

	buildSummaryMetadata() {
		const isGuest = StorageManager.getArray( ONBOARDING_STORAGE_KEYS.STEP1_ACTIONS )
			.some( ( action ) => action.action && action.action.includes( 'guest' ) );
		const isConnected = elementorCommon.config.library_connect?.is_connected || false;
		const siteStarter = StorageManager.getObject( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );

		return [
			{ key: 'login_type', value: isGuest ? 'guest' : 'elementor_login' },
			{ key: 'connect', value: isConnected },
			{ key: 'site_starter', value: siteStarter?.site_starter || 'skip' },
			{
				key: 'steps_completed',
				value: [ 1, 2, 3, 4 ].filter( ( step ) => StorageManager.exists( this.getEndStateSentKey( step ) ) ).length,
			},
		];
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
		this.trackProFeaturesSelected( selectedFeatures, true );
		this.trackStepAction( this.getStepNumber( currentStep ), 'upgrade_now', {
			pro_features_checked: this.extractSelectedFeatureKeys( selectedFeatures ),
		} );
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

		if ( Array.isArray( selectedFeatures.one ) ) {
			allFeatures.push( ...selectedFeatures.one );
		}

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
		TimingManager.clearStaleSessionData();

		if ( ! TimingManager.hasOnboardingStarted() ) {
			TimingManager.initializeOnboardingStartTime();
		}

		this.trackInitialized();

		if ( this.hasResumeProgress() ) {
			this.trackResume( this.getResumeStepNumber() );
		}
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
		this.trackSiteStarterSelected( siteStarter );
		this.updateChoiceWithReturnTracking( existingChoice, siteStarter );
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
			this.trackSiteStarterSelected( choiceData.site_starter );
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
		this.trackSiteStarterSelected( siteStarter );
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

	sendStepEndStateInternal( stepNumber, storageKey, eventName, stepName ) {
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

		const stepTimeSpent = TimingManager.calculateStepTimeSpent( stepNumber );

		EventDispatcher.trackEvent(
			ONBOARDING_EVENTS.STEP_COMPLETED,
			{
				interaction_type: 'step_complete',
				target_type: 'summary',
				target_name: STEP_TARGET_NAMES[ stepNumber ],
				interaction_result: 'step_completed',
				target_value: stepLocationL1( stepNumber ),
				target_location: 'onboarding',
				location_l1: stepLocationL1( stepNumber ),
				metadata: {
					actions,
					time_spent_s: stepTimeSpent,
				},
			},
			endStateSentKey,
		);

		if ( ONBOARDING_STEP_NAMES.SITE_STARTER === stepName ) {
			this.stopSessionRecordingIfNeeded();
			this.trackOnboardingSummary( stepNumber );
			clearEventQueue();
		}

		StorageManager.remove( storageKey );
		StorageManager.setString( endStateSentKey, 'true' );
		TimingManager.clearStepStartTime( stepNumber );
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
				eventName: ONBOARDING_EVENTS.STEP_COMPLETED,
				stepName: ONBOARDING_STEP_NAMES.CONNECT,
			},
			2: {
				storageKey: ONBOARDING_STORAGE_KEYS.STEP2_ACTIONS,
				eventName: ONBOARDING_EVENTS.STEP_COMPLETED,
				stepName: ONBOARDING_STEP_NAMES.HELLO_BIZ,
			},
			3: {
				storageKey: ONBOARDING_STORAGE_KEYS.STEP3_ACTIONS,
				eventName: ONBOARDING_EVENTS.STEP_COMPLETED,
				stepName: ONBOARDING_STEP_NAMES.PRO_FEATURES,
			},
			4: {
				storageKey: ONBOARDING_STORAGE_KEYS.STEP4_ACTIONS,
				eventName: ONBOARDING_EVENTS.STEP_COMPLETED,
				stepName: ONBOARDING_STEP_NAMES.SITE_STARTER,
			},
		};

		return stepConfigs[ stepNumber ] || null;
	}

	sendConnectionSuccessEvents( data ) {
		this.sendAppropriateStatusEvent( 'success', data );
		this.sendStoredExperimentData();
		EventDispatcher.flushQueue();
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
		this.trackConnect( status, data );
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

		if ( hasUpgradeTopbarInActions ) {
			delete this.pendingHoverActions[ stepNumber ];
			return;
		}

		const hoverData = this.pendingHoverActions[ stepNumber ];
		const stepConfig = this.getStepConfig( stepNumber );

		if ( stepConfig ) {
			this.trackStepActionInternal( stepNumber, 'upgrade_topbar', stepConfig.storageKey, {
				upgrade_hovered: hoverData.upgrade_hovered,
				hover_timestamp: hoverData.hover_timestamp,
			} );
		}

		delete this.pendingHoverActions[ stepNumber ];
	}

	hasExistingUpgradeClickEvent( stepNumber ) {
		const stepConfig = this.getStepConfig( stepNumber );
		if ( ! stepConfig ) {
			return false;
		}

		const actions = StorageManager.getArray( stepConfig.storageKey );
		return actions.some( ( action ) =>
			action.action &&
			'upgrade_topbar' === action.action &&
			action.upgrade_clicked &&
			'no_click' !== action.upgrade_clicked,
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

	startSessionRecordingIfNeeded() {
		if ( this.#hasAttemptedSessionRecording ) {
			return;
		}

		if ( ! elementorCommon?.config?.editor_events?.session_replays?.coreOnboarding ) {
			return;
		}

		const featureFlagPromise = elementorCommon?.eventsManager?.featureFlagIsActive?.( 'core-onboarding-session-replays' );
		if ( ! featureFlagPromise ) {
			return;
		}

		this.#hasAttemptedSessionRecording = true;

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
		EventDispatcher.trackEvent(
			ONBOARDING_EVENTS.SESSION_REPLAY_START,
			{
				interaction_type: 'load',
				target_type: 'loaded',
				target_name: 'session_replay',
				interaction_result: 'session_replay_started',
				target_location: 'onboarding',
				location_l1: '1',
			},
			'core_onboarding_session_replay_start',
		);

		if ( ! EventDispatcher.canSendEvents() ) {
			return;
		}

		if ( elementorCommon?.eventsManager?.isSessionRecordingInProgress?.() ) {
			return;
		}

		elementorCommon.eventsManager?.startSessionRecording();
	}

	stopSessionRecordingIfNeeded() {
		if ( ! this.#hasAttemptedSessionRecording ) {
			return;
		}

		elementorCommon.eventsManager?.stopSessionRecording();
		this.#hasAttemptedSessionRecording = false;
	}

	onStepLoad( currentStep ) {
		const stepNumber = this.getStepNumber( currentStep );

		TimingManager.trackStepStartTime( stepNumber );
		this.trackStepViewed( stepNumber );

		if ( 1 === stepNumber || 'account' === currentStep ) {
			this.sendExperimentStarted( 101 );
		}

		if ( 2 === stepNumber || 'hello' === currentStep || 'hello_biz' === currentStep ) {
			this.startSessionRecordingIfNeeded();
			this.sendExperimentStarted( 201 );
			this.sendExperimentStarted( 202 );
		}

		if ( 4 === stepNumber || 'goodToGo' === currentStep ) {
			this.checkAndSendReturnToStep4();
			this.sendExperimentStarted( 401 );
			this.sendExperimentStarted( 402 );
		}
	}

	sendThemeInstalled( theme ) {
		this.trackThemeSelected( theme, 'theme_installed' );
	}

	sendThemeMarked() {
		this.trackThemeUnselected();
	}

	sendThemeActivated( theme ) {
		this.trackThemeSelected( theme, 'theme_activated' );
	}

	reportThemeInstallError( errorBody ) {
		this.trackErrorReported( 2, 'install', 'install_hello_theme', errorBody );
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
