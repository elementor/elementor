/* eslint-disable no-console */
import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';
import { options } from './utils';
if ( 'undefined' !== typeof document ) {
	document.addEventListener( 'click', ( event ) => {
		const target = event.target;
		const isOnboardingClick = target.closest( '.onboarding' ) || target.closest( '[data-onboarding]' ) || target.closest( '.site-starter' );

		if ( isOnboardingClick ) {
		}

		const cardGridElement = target.closest( '.e-onboarding__cards-grid' );
		if ( cardGridElement ) {

			OnboardingEventTracking.handleStep4CardClick( event );
		}
	}, true );
	let lastUrl = window.location.href;
	const urlChangeDetector = () => {
		const currentUrl = window.location.href;
		if ( currentUrl !== lastUrl ) {

			const isStep4 = currentUrl.includes( 'goodToGo' ) || currentUrl.includes( 'step4' ) || currentUrl.includes( 'site_starter' );
			if ( isStep4 ) {
				setTimeout( () => {
					OnboardingEventTracking.trackStepStartTime( 4 );
					OnboardingEventTracking.checkAndSendReturnToStep4();
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
const ONBOARDING_EVENTS_MAP = {

const ONBOARDING_STEP_NAMES = {

const ONBOARDING_STORAGE_KEYS = {

export class OnboardingEventTracking {
	static dispatchEvent( eventName, payload ) {

		if ( ! elementorCommon.eventsManager || 'function' !== typeof elementorCommon.eventsManager.dispatchEvent ) {
			return;
		}

		if ( ! elementorCommon.config.editor_events?.can_send_events ) {
			return;
		}

		try {

			// ENHANCED DEBUGGING: Check for time_spent properties in payload
			if ( eventName.includes( 'end_state' ) ) {
					eventName,
			}

			// CRITICAL DEBUGGING: Intercept the actual Mixpanel call
			const originalDispatchEvent = elementorCommon.eventsManager.dispatchEvent;
			const result = originalDispatchEvent.call( elementorCommon.eventsManager, eventName, payload );

			// Log what actually gets sent to Mixpanel
			if ( eventName.includes( 'end_state' ) ) {
					eventName,
					result,
			}

			return result;
		} catch ( error ) {
			this.handleStorageError( 'Failed to dispatch event:', error );
		}
	}

	static updateLibraryConnectConfig( data ) {
		if ( ! elementorCommon.config.library_connect ) {
			return;
		}

		elementorCommon.config.library_connect.is_connected = true;
		elementorCommon.config.library_connect.current_access_level = data.kits_access_level || data.access_level || 0;
		elementorCommon.config.library_connect.current_access_tier = data.access_tier;
		elementorCommon.config.library_connect.plan_type = data.plan_type;
		elementorCommon.config.library_connect.user_id = data.user_id || null;
	}

	static sendUpgradeNowStep3( selectedFeatures, currentStep ) {
		const proFeaturesChecked = this.extractSelectedFeatureKeys( selectedFeatures );
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.UPGRADE_NOW_S3, {
	}

	static extractSelectedFeatureKeys( selectedFeatures ) {
		const allSelectedFeatures = [];
		if ( selectedFeatures.essential ) {
			allSelectedFeatures.push( ...selectedFeatures.essential );
		}
		if ( selectedFeatures.advanced ) {
			allSelectedFeatures.push( ...selectedFeatures.advanced );
		}

		return this.convertFeaturesToEnglishNames( allSelectedFeatures );
	}

	static convertFeaturesToEnglishNames( features ) {
		const englishFeatureNames = this.getConsistentEnglishFeatureNames();
		const featureMapping = this.createFeatureMappingFromOptions( englishFeatureNames );

		return this.mapFeaturesToEnglishEquivalents( features, featureMapping );
	}

	static getConsistentEnglishFeatureNames() {
		return [
			'Templates & Theme Builder',
			'WooCommerce Builder',
			'Lead Collection & Form Builder',
			'Dynamic Content',
			'Popup Builder',
			'Custom Code & CSS',
			'Motion Effects & Animations',
			'Notes & Collaboration',
		];
	}

	static createFeatureMappingFromOptions( englishFeatureNames ) {
		const featureMapping = {};
		options.forEach( ( option, index ) => {
			featureMapping[ option.text ] = englishFeatureNames[ index ];
		} );
		return featureMapping;
	}

	static mapFeaturesToEnglishEquivalents( features, featureMapping ) {
		return features.map( ( feature ) => {
			return featureMapping[ feature ] || feature;
		} );
	}

	static sendHelloBizContinue( stepNumber = 2 ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.HELLO_BIZ_CONTINUE, {
		}
	}

	static initiateCoreOnboarding() {
		const startTime = Date.now();

			startTime,

		try {
			this.clearStaleSessionData();

			localStorage.setItem( ONBOARDING_STORAGE_KEYS.START_TIME, startTime.toString() );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.INITIATED, 'true' );

		} catch ( error ) {
			this.handleStorageError( 'Failed to store onboarding initiation data:', error );
		}
	}

	static sendCoreOnboardingInitiated() {
		const startTimeStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );
		const wasInitiated = localStorage.getItem( ONBOARDING_STORAGE_KEYS.INITIATED );

		if ( ! wasInitiated || ! startTimeStr ) {
			return;
		}

		const startTime = parseInt( startTimeStr, 10 );
		const currentTime = Date.now();
		const totalOnboardingTime = Math.round( ( currentTime - startTime ) / 1000 );

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.CORE_ONBOARDING, {

		try {
			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.INITIATED );
		} catch ( error ) {
			this.handleStorageError( 'Failed to clear onboarding storage:', error );
		}
	}

	static sendConnectStatus( status, trackingOptedIn = false, userTier = null ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CONNECT_STATUS, {
		}
		this.storeConnectStatusEventForLater( status, trackingOptedIn, userTier );
	}

	static trackStepAction( stepNumber, action, additionalData = {} ) {
		const stepConfig = this.getStepConfig( stepNumber );
		if ( stepConfig ) {
			this.trackStepActionInternal( stepNumber, action, stepConfig.actionsKey, additionalData );
		}
	}

	static sendStepEndState( stepNumber ) {
		const stepConfig = this.getStepConfig( stepNumber );
		if ( stepConfig ) {
			this.sendStepEndStateInternal( stepNumber, stepConfig.actionsKey, stepConfig.eventName, stepConfig.stepName, stepConfig.endStateProperty );
		}
	}

	static storeSiteStarterChoice( siteStarter ) {
		try {
				siteStarter,

			const existingChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
			if ( existingChoiceString ) {
				try {
					const existingChoice = JSON.parse( existingChoiceString );
				} catch ( parseError ) {
				}
			} else {
			}

			const choiceData = {

			localStorage.setItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, JSON.stringify( choiceData ) );

			const verifyStored = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store site starter choice:', error );
		}
	}

	static checkAndSendReturnToStep4() {
		try {

			const storedChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );

			if ( ! storedChoiceString ) {
				return;
			}

			const choiceData = JSON.parse( storedChoiceString );

			if ( ! choiceData.return_event_sent ) {

				const returnEventPayload = {
				this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP4_RETURN_STEP4, returnEventPayload );

				choiceData.return_event_sent = true;
				const updatedChoiceData = JSON.stringify( choiceData );
				localStorage.setItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, updatedChoiceData );

			} else {
			}
		} catch ( error ) {
			this.handleStorageError( 'Failed to check and send return to Step 4:', error );
		}
	}

	static getSiteStarterChoice() {
		try {
			const storedChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
			if ( ! storedChoiceString ) {
				return null;
			}

			const choiceData = JSON.parse( storedChoiceString );
			return choiceData.site_starter;
		} catch ( error ) {
			this.handleStorageError( 'Failed to get site starter choice:', error );
			return null;
		}
	}

	static clearSiteStarterChoice() {
		try {
			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		} catch ( error ) {
			this.handleStorageError( 'Failed to clear site starter choice:', error );
		}
	}

	static clearStaleSessionData() {

		// Get recently set step start times (within last 5 seconds) to preserve them
		const recentStepStartTimes = [];
		const currentTime = Date.now();
		const recentThreshold = 5000; // 5 seconds

		[
			ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
			ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
			ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
			ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
		].forEach( ( key ) => {
			const value = localStorage.getItem( key );
			if ( value ) {
				const timestamp = parseInt( value, 10 );
				const age = currentTime - timestamp;
				if ( age < recentThreshold ) {
					recentStepStartTimes.push( key );
				}
			}
		} );

		// CRITICAL FIX: Don't clear pending events that should be sent after connection
		// Also preserve recently set step start times
		const keysToPreserve = [
			ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE,
			ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT,
			ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS,
			ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS,
			ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT,
			ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE,
			ONBOARDING_STORAGE_KEYS.PENDIND_TOP_UPGRADE_MOUSEOVER,
			...recentStepStartTimes,
		];

		const allKeys = Object.values( ONBOARDING_STORAGE_KEYS );
		const keysToRemove = allKeys.filter( ( key ) => ! keysToPreserve.includes( key ) );
		keysToRemove.forEach( ( key ) => {
			const existingValue = localStorage.getItem( key );
			if ( existingValue ) {
			}
			localStorage.removeItem( key );
		} );

		// Log what was preserved
		keysToPreserve.forEach( ( key ) => {
			const existingValue = localStorage.getItem( key );
			if ( existingValue ) {
			}
		} );

	}

	static checkAndSendEditorLoadedFromOnboarding() {
		try {
			const alreadyTracked = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED );
			if ( alreadyTracked ) {
				return;
			}

			const siteStarterChoice = this.getSiteStarterChoice();

			if ( ! siteStarterChoice ) {
				return;
			}

			if ( elementorCommon.eventsManager && 'function' === typeof elementorCommon.eventsManager.dispatchEvent ) {
				elementorCommon.eventsManager.dispatchEvent( ONBOARDING_EVENTS_MAP.EDITOR_LOADED_FROM_ONBOARDING, {
			}

			localStorage.setItem( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED, 'true' );
		} catch ( error ) {
			this.handleStorageError( 'Failed to check and send editor loaded from onboarding:', error );
		}
	}

	static getStepName( stepNumber ) {
		const stepNames = {
			1: ONBOARDING_STEP_NAMES.CONNECT,
			2: ONBOARDING_STEP_NAMES.HELLO_BIZ,
			3: ONBOARDING_STEP_NAMES.PRO_FEATURES,
			4: ONBOARDING_STEP_NAMES.SITE_STARTER,
			5: ONBOARDING_STEP_NAMES.SITE_NAME,
			6: ONBOARDING_STEP_NAMES.SITE_LOGO,
		};
		return stepNames[ stepNumber ] || 'unknown_step';
	}

	static storeSkipEventForLater( currentStep ) {
		try {
			const skipData = {
				currentStep,
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_SKIP, JSON.stringify( skipData ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store skip event:', error );
		}
	}

	static sendStoredSkipEvent() {
		try {
			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_SKIP );
			if ( ! storedDataString ) {
				return;
			}

			const skipData = JSON.parse( storedDataString );
			const stepName = this.getStepName( skipData.currentStep );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.SKIP, {

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_SKIP );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored skip event:', error );
		}
	}

	static sendOnboardingSkip( currentStep ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.SKIP, {
		}
		this.storeSkipEventForLater( currentStep );
	}

	static sendExitButtonEvent( currentStep ) {

		const eventData = {

		this.dispatchEvent( ONBOARDING_EVENTS_MAP.EXIT_BUTTON, eventData );

		// Add to step end state tracking
		this.trackStepAction( currentStep, 'exit_button' );
	}

	static sendTopUpgrade( currentStep, upgradeClicked ) {
		const canSendEvents = elementorCommon.config.editor_events?.can_send_events;
			currentStep,
			upgradeClicked,

		// CRITICAL VALIDATION: Don't process invalid step data
		if ( ! currentStep || '' === currentStep || null === currentStep || currentStep === undefined ) {
			return;
		}

		// ADDITIONAL VALIDATION: Ensure upgradeClicked is valid
		if ( ! upgradeClicked || '' === upgradeClicked ) {
			return;
		}

		if ( canSendEvents ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.TOP_UPGRADE, {
		}

		if ( 1 === currentStep ) {
			this.storeTopUpgradeEventForLater( currentStep, upgradeClicked );
		} else {
		}
	}

	static sendCreateMyAccount( currentStep, createAccountClicked ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_MY_ACCOUNT, {
		}
		this.storeCreateMyAccountEventForLater( currentStep, createAccountClicked );
	}

	static sendCreateAccountStatus( status, currentStep = 1 ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_ACCOUNT_STATUS, {
		}
		this.storeCreateAccountStatusEventForLater( status, currentStep );
	}

	static sendStep1ClickedConnect( currentStep = 1 ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP1_CLICKED_CONNECT, {
		}
		this.storeStep1ClickedConnectEventForLater( currentStep );
	}

	static storeTopUpgradeEventForLater( currentStep, upgradeClicked ) {
		try {

			// CRITICAL VALIDATION: Don't store invalid data
			if ( ! currentStep || '' === currentStep || null === currentStep || currentStep === undefined ) {
				return;
			}

			if ( ! upgradeClicked || '' === upgradeClicked ) {
				return;
			}

			const existingDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
			const existingEvents = existingDataString ? JSON.parse( existingDataString ) : [];
			const eventData = {
				currentStep,
				upgradeClicked,

			existingEvents.push( eventData );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE, JSON.stringify( existingEvents ) );
			// VERIFICATION: Confirm data was stored correctly
			const verifyStored = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store top upgrade event:', error );
		}
	}

	static sendStoredTopUpgradeEvent() {
		try {

			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
			if ( ! storedDataString ) {
				for ( let i = 0; i < localStorage.length; i++ ) {
					const key = localStorage.key( i );
					if ( key && key.includes( 'onboarding' ) ) {
					}
				}
				return;
			}

			const storedEvents = JSON.parse( storedDataString );
			const eventsArray = Array.isArray( storedEvents ) ? storedEvents : [ storedEvents ];
			eventsArray.forEach( ( eventData, index ) => {

				this.dispatchEvent( ONBOARDING_EVENTS_MAP.TOP_UPGRADE, {
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored top upgrade event:', error );
		}
	}

	static storeCreateMyAccountEventForLater( currentStep, createAccountClicked ) {
		try {
			const eventData = {
				currentStep,
				createAccountClicked,
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT, JSON.stringify( eventData ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store create my account event:', error );
		}
	}

	static sendStoredCreateMyAccountEvent() {
		try {
			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );
			if ( ! storedDataString ) {
				return;
			}

			const eventData = JSON.parse( storedDataString );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_MY_ACCOUNT, {

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored create my account event:', error );
		}
	}

	static scheduleDelayedNoClickEvent( currentStep, delay = 500 ) {
		try {
			this.cancelDelayedNoClickEvent();

			const eventData = {
				currentStep,
				}, delay ),
			};
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK, JSON.stringify( {
		} catch ( error ) {
			this.handleStorageError( 'Failed to schedule delayed no-click event:', error );
		}
	}

	static cancelDelayedNoClickEvent() {
		try {
			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK );
		} catch ( error ) {
			this.handleStorageError( 'Failed to cancel delayed no-click event:', error );
		}
	}

	static sendDelayedNoClickEvent() {
		try {
			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK );
			if ( ! storedDataString ) {
				return;
			}

			const eventData = JSON.parse( storedDataString );
			this.sendTopUpgrade( eventData.currentStep, 'no_click' );
			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send delayed no-click event:', error );
		}
	}

	static storeCreateAccountStatusEventForLater( status, currentStep ) {
		try {
			const eventData = {
				status,
				currentStep,
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS, JSON.stringify( eventData ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store create account status event:', error );
		}
	}

	static sendStoredCreateAccountStatusEvent() {
		try {
			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS );
			if ( ! storedDataString ) {
				return;
			}

			const eventData = JSON.parse( storedDataString );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_ACCOUNT_STATUS, {

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored create account status event:', error );
		}
	}

	static storeConnectStatusEventForLater( status, trackingOptedIn, userTier ) {
		try {
			const eventData = {
				status,
				trackingOptedIn,
				userTier,
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS, JSON.stringify( eventData ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store connect status event:', error );
		}
	}

	static sendStoredConnectStatusEvent() {
		try {
			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS );
			if ( ! storedDataString ) {
				return;
			}

			const eventData = JSON.parse( storedDataString );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.CONNECT_STATUS, {

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored connect status event:', error );
		}
	}

	static storeStep1ClickedConnectEventForLater( currentStep ) {
		try {
			const eventData = {
				currentStep,
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT, JSON.stringify( eventData ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store step1 clicked connect event:', error );
		}
	}

	static storeStep1EndStateForLater( eventData, storageKey ) {
		try {
			const storedEventData = {
				...eventData,
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE, JSON.stringify( storedEventData ) );
			localStorage.removeItem( storageKey );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store step1 end state event:', error );
		}
	}

	static sendStoredStep1ClickedConnectEvent() {
		try {
			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT );
			if ( ! storedDataString ) {
				return;
			}

			const eventData = JSON.parse( storedDataString );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP1_CLICKED_CONNECT, {

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored step1 clicked connect event:', error );
		}
	}

	static sendStoredStep1EndStateEvent() {
		try {
			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE );
			if ( ! storedDataString ) {
				return;
			}

			const eventData = JSON.parse( storedDataString );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP1_END_STATE, {
				...eventData,

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored step1 end state event:', error );
		}
	}

	static setupUpgradeButtonTracking( buttonElementOrStep, currentStepOrSelector ) {
		if ( 'undefined' === typeof document ) {
			return null;
		}

		if ( 'number' === typeof buttonElementOrStep ) {
			return this.setupAllUpgradeButtons( buttonElementOrStep, currentStepOrSelector );
		}

		return this.setupSingleUpgradeButton( buttonElementOrStep, currentStepOrSelector );
	}

	static setupAllUpgradeButtons( currentStep, selector = '.elementor-button-upgrade, .eps-button--upgrade, [data-upgrade-button]' ) {
		const upgradeButtons = document.querySelectorAll( selector );

		const cleanupFunctions = [];

		upgradeButtons.forEach( ( button, index ) => {
			const cleanup = this.setupSingleUpgradeButton( button, currentStep );
			if ( cleanup ) {
				cleanupFunctions.push( cleanup );
			}
		} );

		return () => {
			cleanupFunctions.forEach( ( cleanup ) => cleanup() );
		};
	}

	static setupSingleUpgradeButton( buttonElement, currentStep ) {
		if ( ! buttonElement ) {
			return null;
		}
		let hasHovered = false;
		let hasClicked = false;

		const handleMouseEnter = () => {
			hasHovered = true;
		};

		const handleMouseLeave = () => {
			if ( hasHovered && ! hasClicked ) {
				this.scheduleDelayedNoClickEvent( currentStep );
				hasHovered = false;
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

	static determineUpgradeClickedValue( buttonElement ) {
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

	static setupTopUpgradeTracking( currentStep ) {
		return this.setupAllUpgradeButtons( currentStep );
	}

	static setupSingleUpgradeButtonTracking( buttonElement, currentStep ) {
		return this.setupSingleUpgradeButton( buttonElement, currentStep );
	}

	static trackExitAndSendEndState( currentStep ) {
		this.trackStepAction( currentStep, 'exit' );
		this.sendStepEndState( currentStep );
	}

	static trackStepActionInternal( stepNumber, action, storageKey, additionalData = {} ) {
		try {
				stepNumber,
				action,
				storageKey,
				additionalData,
			} );

			const timeData = this.calculateTimeSpent();
			if ( ! timeData ) {
				return;
			}

			const existingActions = this.getStoredActions( storageKey );
			const actionData = {
				action,
			};

				actionData,

				action,
				stepNumber,

			existingActions.push( actionData );
			localStorage.setItem( storageKey, JSON.stringify( existingActions ) );

		} catch ( error ) {
			this.handleStorageError( `Failed to track Step ${ stepNumber } action:`, error );
		}
	}

	static sendStepEndStateInternal( stepNumber, storageKey, eventName, stepName, endStateProperty ) {
		try {
				stepNumber,
				storageKey,
				eventName,
				stepName,
				endStateProperty,
			} );

			const actionsString = localStorage.getItem( storageKey );
			const startTimeString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );

				actionsString,
				startTimeString,

			if ( ! actionsString ) {
				return;
			}

			const actions = JSON.parse( actionsString );
			const eventData = {

			if ( startTimeString ) {
				const startTime = parseInt( startTimeString, 10 );
				const currentTime = Date.now();
				const totalTimeSpent = Math.round( ( currentTime - startTime ) / 1000 );
				eventData.time_spent = `${ totalTimeSpent }s`;

					startTime,
					currentTime,
					totalTimeSpent,

			} else {
			}

			const stepTimeSpent = this.calculateStepTimeSpent( stepNumber );
			if ( stepTimeSpent !== null ) {
				eventData.step_time_spent = `${ stepTimeSpent }s`;

			} else {

				// Additional debugging for missing step time
				const stepStartTimeKey = this.getStepStartTimeKey( stepNumber );
				const stepStartTimeValue = localStorage.getItem( stepStartTimeKey );
					stepStartTimeKey,
					stepStartTimeValue,
			}

			eventData[ endStateProperty ] = actions;
			// ENHANCED DEBUGGING: Verify time properties are in final event data

			if ( elementorCommon.config.editor_events?.can_send_events ) {
				this.dispatchEvent( eventName, eventData );
				localStorage.removeItem( storageKey );
				this.clearStepStartTime( stepNumber );
			} else if ( 1 === stepNumber ) {
				this.storeStep1EndStateForLater( eventData, storageKey );
			} else {
				this.dispatchEvent( eventName, eventData );
				localStorage.removeItem( storageKey );
				this.clearStepStartTime( stepNumber );
			}
		} catch ( error ) {
			this.handleStorageError( `Failed to send Step ${ stepNumber } end state:`, error );
		}
	}

	static calculateTimeSpent() {
		const startTimeString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );

		if ( ! startTimeString ) {
			return null;
		}

		const startTime = parseInt( startTimeString, 10 );
		const currentTime = Date.now();
		const timeSpent = Math.round( ( currentTime - startTime ) / 1000 );

			startTime,
			currentTime,
			timeSpent,

		return { startTime, currentTime, timeSpent };
	}

	static trackStepStartTime( stepNumber ) {
		try {
			const stepStartTimeKey = this.getStepStartTimeKey( stepNumber );
			const currentTime = Date.now();

			const existingStartTime = localStorage.getItem( stepStartTimeKey );
			if ( existingStartTime ) {
				return;
			}

				stepStartTimeKey,
				currentTime,

			localStorage.setItem( stepStartTimeKey, currentTime.toString() );

			const verifyStored = localStorage.getItem( stepStartTimeKey );
		} catch ( error ) {
			this.handleStorageError( `Failed to track step ${ stepNumber } start time:`, error );
		}
	}

	static calculateStepTimeSpent( stepNumber ) {
		try {
			const stepStartTimeKey = this.getStepStartTimeKey( stepNumber );
			const stepStartTimeString = localStorage.getItem( stepStartTimeKey );

				stepStartTimeKey,
				stepStartTimeString,
			} );

			if ( ! stepStartTimeString ) {
				return null;
			}

			const stepStartTime = parseInt( stepStartTimeString, 10 );
			const currentTime = Date.now();
			const stepTimeSpent = Math.round( ( currentTime - stepStartTime ) / 1000 );

				stepStartTime,
				currentTime,
				stepTimeSpent,

			return stepTimeSpent;
		} catch ( error ) {
			this.handleStorageError( `Failed to calculate step ${ stepNumber } time:`, error );
			return null;
		}
	}

	static getStepStartTimeKey( stepNumber ) {
		const stepStartTimeKeys = {
			1: ONBOARDING_STORAGE_KEYS.STEP1_START_TIME,
			2: ONBOARDING_STORAGE_KEYS.STEP2_START_TIME,
			3: ONBOARDING_STORAGE_KEYS.STEP3_START_TIME,
			4: ONBOARDING_STORAGE_KEYS.STEP4_START_TIME,
		};
		return stepStartTimeKeys[ stepNumber ];
	}

	static clearStepStartTime( stepNumber ) {
		try {
			const stepStartTimeKey = this.getStepStartTimeKey( stepNumber );
			localStorage.removeItem( stepStartTimeKey );
		} catch ( error ) {
			this.handleStorageError( `Failed to clear step ${ stepNumber } start time:`, error );
		}
	}

	static getStoredActions( storageKey ) {
		const existingActionsString = localStorage.getItem( storageKey );
		return existingActionsString ? JSON.parse( existingActionsString ) : [];
	}

	static getStepNumber( pageId ) {

		// If already a number, return it directly
		if ( 'number' === typeof pageId ) {
			return pageId;
		}

		// If string number, convert to number
		if ( 'string' === typeof pageId && ! isNaN( pageId ) ) {
			const numericStep = parseInt( pageId, 10 );
			return numericStep;
		}

		// Map page IDs to step numbers
		const stepMapping = {

		const mappedStep = stepMapping[ pageId ] || null;

		return mappedStep;
	}

	static getStepConfig( stepNumber ) {
		const stepConfigs = {
			1: {
			2: {
			3: {
			4: {
		};

		return stepConfigs[ stepNumber ] || null;
	}

	static sendConnectionSuccessEvents( data ) {
		this.sendCoreOnboardingInitiated();
		this.sendAppropriateStatusEvent( 'success', data );
		this.sendAllStoredEvents();
	}

	static sendConnectionFailureEvents() {
		this.sendAppropriateStatusEvent( 'fail' );
	}

	static sendAppropriateStatusEvent( status, data = null ) {
		const hasCreateAccountAction = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );
		const hasConnectAction = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT );

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

	static handleStep4CardClick() {

		const hasPreviousClick = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK );
			hasPreviousClick,

		if ( hasPreviousClick ) {

			const returnEventPayload = {

			this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP4_RETURN_STEP4, returnEventPayload );
		} else {
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK, 'true' );

			const verifyStored = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK );
		}

	}

	static handleSiteStarterChoice( siteStarter ) {
			siteStarter,

		this.trackStepStartTime( 4 );

		this.storeSiteStarterChoice( siteStarter );

		this.trackStepAction( 4, 'site_starter', {

		this.sendStepEndState( 4 );

	}

	static sendAllStoredEvents() {
		this.sendStoredSkipEvent();
		this.sendStoredConnectStatusEvent();
		this.sendStoredTopUpgradeEvent();
		this.sendStoredCreateMyAccountEvent();
		this.sendStoredCreateAccountStatusEvent();
		this.sendStoredStep1ClickedConnectEvent();
		this.sendStoredStep1EndStateEvent();
	}

	static sendStoredStep1EventsOnStep2() {
		this.sendStoredTopUpgradeEvent();
	}

	static onStepLoad( currentStep ) {
			currentStep,

		const stepNumber = this.getStepNumber( currentStep );

		if ( stepNumber ) {
			this.trackStepStartTime( stepNumber );
		} else {

			// Fallback: if currentStep is numeric, use it directly
			if ( 'number' === typeof currentStep && currentStep >= 1 && currentStep <= 6 ) {
				this.trackStepStartTime( currentStep );
			} else if ( 'string' === typeof currentStep && ! isNaN( currentStep ) ) {
				const numericStep = parseInt( currentStep, 10 );
				if ( numericStep >= 1 && numericStep <= 6 ) {
					this.trackStepStartTime( numericStep );
				}
			}
		}

		if ( 2 === currentStep || 'hello' === currentStep ) {
			this.sendStoredStep1EventsOnStep2();
		}

		if ( 4 === stepNumber || 'goodToGo' === currentStep ) {

			// Debug method removed - silent fail
			this.checkAndSendReturnToStep4();
		}
	}
	static handleStorageError( message, error ) {
		// Silent fail - don't let storage errors break the user experience
	}
}

export { ONBOARDING_STORAGE_KEYS, ONBOARDING_STEP_NAMES };
