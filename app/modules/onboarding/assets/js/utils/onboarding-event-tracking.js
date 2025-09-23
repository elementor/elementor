/* eslint-disable no-console */
import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';
import { options } from './utils';

console.log( '🚀 OnboardingEventTracking loaded with COMPREHENSIVE RETURN-TO-STEP4 DEBUGGING!' );

if ( 'undefined' !== typeof document ) {
	document.addEventListener( 'click', ( event ) => {
		const target = event.target;
		const isOnboardingClick = target.closest( '.onboarding' ) || target.closest( '[data-onboarding]' ) || target.closest( '.site-starter' );

		if ( isOnboardingClick ) {
			console.log( '🖱️ ONBOARDING CLICK DETECTED:', {
				target: target.tagName,
				className: target.className,
				id: target.id,
				textContent: target.textContent?.trim().substring( 0, 50 ),
				closest: {
					onboarding: !! target.closest( '.onboarding' ),
					dataOnboarding: !! target.closest( '[data-onboarding]' ),
					siteStarter: !! target.closest( '.site-starter' ),
				},
				currentUrl: window.location.href,
				timestamp: Date.now(),
			} );
		}

		const cardGridElement = target.closest( '.e-onboarding__cards-grid' );
		if ( cardGridElement ) {
			console.log( '🎯 STEP 4 CARD GRID CLICK DETECTED:', {
				target: target.tagName,
				className: target.className,
				cardElement: cardGridElement,
				timestamp: Date.now(),
			} );

			OnboardingEventTracking.handleStep4CardClick( event );
		}
	}, true );

	console.log( '🖱️ Global onboarding click listener attached' );

	let lastUrl = window.location.href;
	const urlChangeDetector = () => {
		const currentUrl = window.location.href;
		if ( currentUrl !== lastUrl ) {
			console.log( '🔄 URL CHANGE DETECTED:', {
				from: lastUrl,
				to: currentUrl,
				timestamp: Date.now(),
				timestampFormatted: new Date().toISOString(),
			} );

			const isStep4 = currentUrl.includes( 'goodToGo' ) || currentUrl.includes( 'step4' ) || currentUrl.includes( 'site_starter' );
			if ( isStep4 ) {
				console.log( '🎯 NAVIGATED TO STEP 4 - ensuring step start time and triggering return check...' );
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
		console.log( '🔄 POPSTATE EVENT - browser navigation detected' );
		setTimeout( urlChangeDetector, 100 );
	} );

	console.log( '🔄 URL change monitoring active' );
}

if ( 'undefined' !== typeof window ) {
	window.debugOnboardingTimeSpent = () => {
		console.log( '🔍 Manual debug trigger called' );
		OnboardingEventTracking.debugLocalStorageState();

		const timeSpentData = OnboardingEventTracking.calculateTimeSpent();
		console.log( '⏱️ Current time spent calculation:', timeSpentData );

		for ( let step = 1; step <= 4; step++ ) {
			const stepTimeSpent = OnboardingEventTracking.calculateStepTimeSpent( step );
			console.log( `⏱️ Step ${ step } time spent:`, stepTimeSpent );
		}
	};

	window.debugReturnToStep4 = () => {
		console.log( '🎯 Manual return to step 4 debug trigger called' );
		OnboardingEventTracking.debugReturnToStep4Scenario();
	};

	window.testReturnToStep4 = () => {
		console.log( '🧪 Testing return to step 4 scenario...' );
		OnboardingEventTracking.checkAndSendReturnToStep4();
	};

	window.simulateSiteStarterChoice = ( siteStarter ) => {
		console.log( '🧪 Simulating site starter choice:', siteStarter );
		OnboardingEventTracking.handleSiteStarterChoice( siteStarter );
	};

	window.monitorOnboardingCalls = () => {
		console.log( '🔍 Setting up onboarding method call monitoring...' );

		const originalHandleSiteStarterChoice = OnboardingEventTracking.handleSiteStarterChoice;
		OnboardingEventTracking.handleSiteStarterChoice = function( ...args ) {
			console.log( '🎯 INTERCEPTED: handleSiteStarterChoice called with:', args );
			console.trace( '🎯 Call stack:' );
			return originalHandleSiteStarterChoice.apply( this, args );
		};

		const originalOnStepLoad = OnboardingEventTracking.onStepLoad;
		OnboardingEventTracking.onStepLoad = function( ...args ) {
			console.log( '🔄 INTERCEPTED: onStepLoad called with:', args );
			console.trace( '🔄 Call stack:' );
			return originalOnStepLoad.apply( this, args );
		};

		console.log( '✅ Monitoring setup complete' );
	};

	window.debugStepTiming = () => {
		console.log( '⏱️ DEBUG: Step timing analysis' );
		console.log( '⏱️ =========================' );

		for ( let step = 1; step <= 4; step++ ) {
			const stepStartTimeKey = OnboardingEventTracking.getStepStartTimeKey( step );
			const stepStartTime = localStorage.getItem( stepStartTimeKey );

			console.log( `⏱️ Step ${ step }:`, {
				startTimeKey: stepStartTimeKey,
				startTime: stepStartTime,
				startTimeFormatted: stepStartTime ? new Date( parseInt( stepStartTime, 10 ) ).toISOString() : 'NOT SET',
				timeSinceStart: stepStartTime ? Math.round( ( Date.now() - parseInt( stepStartTime, 10 ) ) / 1000 ) + 's' : 'N/A',
			} );
		}

		const globalStartTime = localStorage.getItem( 'elementor_onboarding_start_time' );
		console.log( '⏱️ Global onboarding start:', {
			startTime: globalStartTime,
			startTimeFormatted: globalStartTime ? new Date( parseInt( globalStartTime, 10 ) ).toISOString() : 'NOT SET',
			totalTime: globalStartTime ? Math.round( ( Date.now() - parseInt( globalStartTime, 10 ) ) / 1000 ) + 's' : 'N/A',
		} );

		console.log( '⏱️ =========================' );
	};

	window.debugStep4CardClick = () => {
		console.log( '🎯 DEBUG: Step 4 card click tracking analysis' );
		console.log( '🎯 =========================================' );

		const hasPreviousClick = localStorage.getItem( 'elementor_onboarding_s4_has_previous_click' );
		console.log( '🎯 Step 4 previous click flag:', {
			key: 'elementor_onboarding_s4_has_previous_click',
			value: hasPreviousClick,
			hasBeenClicked: !! hasPreviousClick,
		} );

		console.log( '🎯 Next card click will:', hasPreviousClick ? 'TRIGGER return event' : 'SET the flag for future detection' );
		console.log( '🎯 =========================================' );
	};

	window.testStep4CardClick = () => {
		console.log( '🧪 Testing step 4 card click detection...' );
		const mockEvent = { target: document.body };
		OnboardingEventTracking.handleStep4CardClick( mockEvent );
	};

	window.resetStep4CardClick = () => {
		console.log( '🧹 Resetting step 4 card click flag...' );
		localStorage.removeItem( 'elementor_onboarding_s4_has_previous_click' );
		console.log( '✅ Step 4 card click flag reset' );
	};

	console.log( '🔍 Debug functions exposed:' );
	console.log( '  - window.debugOnboardingTimeSpent()' );
	console.log( '  - window.debugReturnToStep4()' );
	console.log( '  - window.testReturnToStep4()' );
	console.log( '  - window.simulateSiteStarterChoice(siteStarter)' );
	console.log( '  - window.monitorOnboardingCalls()' );
	console.log( '  - window.debugStepTiming()' );
	console.log( '  - window.debugStep4CardClick()' );
	console.log( '  - window.testStep4CardClick()' );
	console.log( '  - window.resetStep4CardClick()' );
}

const ONBOARDING_EVENTS_MAP = {
	UPGRADE_NOW_S3: 'core_onboarding_s3_upgrade_now',
	HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz',
	CORE_ONBOARDING: 'core_onboarding',
	CONNECT_STATUS: 'core_onboarding_connect_status',
	STEP1_END_STATE: 'core_onboarding_s1_end_state',
	STEP2_END_STATE: 'core_onboarding_s2_end_state',
	STEP3_END_STATE: 'core_onboarding_s3_end_state',
	STEP4_END_STATE: 'core_onboarding_s4_end_state',
	STEP4_RETURN_STEP4: 'core_onboarding_s4_return',
	EDITOR_LOADED_FROM_ONBOARDING: 'editor_loaded_from_onboarding',
	POST_ONBOARDING_1ST_CLICK: 'post_onboarding_1st_click',
	POST_ONBOARDING_2ND_CLICK: 'post_onboarding_2nd_click',
	POST_ONBOARDING_3RD_CLICK: 'post_onboarding_3rd_click',
	EXIT: 'core_onboarding_exit',
	SKIP: 'core_onboarding_skip',
	TOP_UPGRADE: 'core_onboarding_top_upgrade',
	CREATE_MY_ACCOUNT: 'core_onboarding_s1_create_my_account',
	CREATE_ACCOUNT_STATUS: 'core_onboarding_create_account_status',
	STEP1_CLICKED_CONNECT: 'core_onboarding_s1_clicked_connect',
};

const ONBOARDING_STEP_NAMES = {
	CONNECT: 'connect',
	HELLO_BIZ: 'hello_biz',
	PRO_FEATURES: 'pro_features',
	SITE_STARTER: 'site_starter',
	SITE_NAME: 'site_name',
	SITE_LOGO: 'site_logo',
	ONBOARDING_START: 'onboarding_start',
};

const ONBOARDING_STORAGE_KEYS = {
	START_TIME: 'elementor_onboarding_start_time',
	INITIATED: 'elementor_onboarding_initiated',
	STEP1_ACTIONS: 'elementor_onboarding_s1_actions',
	STEP2_ACTIONS: 'elementor_onboarding_s2_actions',
	STEP3_ACTIONS: 'elementor_onboarding_s3_actions',
	STEP4_ACTIONS: 'elementor_onboarding_s4_actions',
	STEP1_START_TIME: 'elementor_onboarding_s1_start_time',
	STEP2_START_TIME: 'elementor_onboarding_s2_start_time',
	STEP3_START_TIME: 'elementor_onboarding_s3_start_time',
	STEP4_START_TIME: 'elementor_onboarding_s4_start_time',
	STEP4_SITE_STARTER_CHOICE: 'elementor_onboarding_s4_site_starter_choice',
	STEP4_HAS_PREVIOUS_CLICK: 'elementor_onboarding_s4_has_previous_click',
	EDITOR_LOAD_TRACKED: 'elementor_onboarding_editor_load_tracked',
	POST_ONBOARDING_CLICK_COUNT: 'elementor_onboarding_click_count',
	PENDING_EXIT: 'elementor_onboarding_pending_exit',
	PENDING_SKIP: 'elementor_onboarding_pending_skip',
	PENDING_CONNECT_STATUS: 'elementor_onboarding_pending_connect_status',
	PENDING_CREATE_ACCOUNT_STATUS: 'elementor_onboarding_pending_create_account_status',
	PENDING_CREATE_MY_ACCOUNT: 'elementor_onboarding_pending_create_my_account',
	PENDING_TOP_UPGRADE: 'elementor_onboarding_pending_top_upgrade',
	PENDING_TOP_UPGRADE_NO_CLICK: 'elementor_onboarding_pending_top_upgrade_no_click',
	PENDING_STEP1_CLICKED_CONNECT: 'elementor_onboarding_pending_step1_clicked_connect',
	PENDING_STEP1_END_STATE: 'elementor_onboarding_pending_step1_end_state',
};

export class OnboardingEventTracking {
	// State management for mutual exclusivity between x_button and close_window
	static xButtonClicked = false;

	static markXButtonClicked() {
		console.log( '🔒 X button clicked - preventing close_window tracking' );
		this.xButtonClicked = true;
	}

	static resetXButtonState() {
		console.log( '🔓 Resetting X button state' );
		this.xButtonClicked = false;
	}

	static dispatchEvent( eventName, payload ) {
		console.log( '🚀 dispatchEvent called:', { eventName, payload } );

		if ( ! elementorCommon.eventsManager || 'function' !== typeof elementorCommon.eventsManager.dispatchEvent ) {
			console.log( '❌ eventsManager not available or dispatchEvent not a function' );
			return;
		}

		if ( ! elementorCommon.config.editor_events?.can_send_events ) {
			console.log( '❌ can_send_events is false, not sending event:', { eventName, can_send_events: elementorCommon.config.editor_events?.can_send_events } );
			return;
		}

		try {
			console.log( '✅ Dispatching event to Mixpanel:', { eventName, payload } );
			return elementorCommon.eventsManager.dispatchEvent( eventName, payload );
		} catch ( error ) {
			console.error( '❌ Failed to dispatch event:', error );
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
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.click,
			step_number: currentStep,
			step_name: ONBOARDING_STEP_NAMES.PRO_FEATURES,
			pro_features_checked: proFeaturesChecked,
		} );
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
				location: 'plugin_onboarding',
				trigger: eventsConfig.triggers.click,
				step_number: stepNumber,
				step_name: ONBOARDING_STEP_NAMES.HELLO_BIZ,
			} );
		}
	}

	static initiateCoreOnboarding() {
		const startTime = Date.now();

		console.log( '🚀 initiateCoreOnboarding called:', {
			startTime,
			startTimeFormatted: new Date( startTime ).toISOString(),
		} );

		try {
			this.clearStaleSessionData();

			localStorage.setItem( ONBOARDING_STORAGE_KEYS.START_TIME, startTime.toString() );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.INITIATED, 'true' );

			console.log( '✅ Onboarding initiation data stored successfully:', {
				startTimeKey: ONBOARDING_STORAGE_KEYS.START_TIME,
				initiatedKey: ONBOARDING_STORAGE_KEYS.INITIATED,
				startTimeValue: startTime.toString(),
			} );
		} catch ( error ) {
			console.error( '❌ Failed to store onboarding initiation data:', error );
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
			location: 'plugin_onboarding',
			trigger: 'core_onboarding_initiated',
			step_number: 1,
			step_name: ONBOARDING_STEP_NAMES.ONBOARDING_START,
			onboarding_start_time: startTime,
			total_onboarding_time_seconds: totalOnboardingTime,
		} );

		try {
			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.INITIATED );
		} catch ( error ) {
			this.handleStorageError( 'Failed to clear onboarding storage:', error );
		}
	}

	static sendConnectStatus( status, trackingOptedIn = false, userTier = null ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CONNECT_STATUS, {
				location: 'plugin_onboarding',
				trigger: 'connect_flow_returns_status',
				step_number: 1,
				step_name: ONBOARDING_STEP_NAMES.CONNECT,
				onboarding_connect_status: status,
				tracking_opted_in: trackingOptedIn,
				user_tier: userTier,
			} );
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
			console.log( '🎯 storeSiteStarterChoice called:', {
				siteStarter,
				timestamp: Date.now(),
				storageKey: ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE,
			} );

			const existingChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
			if ( existingChoiceString ) {
				console.log( '🔄 Existing site starter choice found:', existingChoiceString );
				try {
					const existingChoice = JSON.parse( existingChoiceString );
					console.log( '🔄 Parsed existing choice:', existingChoice );
				} catch ( parseError ) {
					console.error( '❌ Failed to parse existing choice:', parseError );
				}
			} else {
				console.log( '✨ No existing site starter choice found - this is the first choice' );
			}

			const choiceData = {
				site_starter: siteStarter,
				timestamp: Date.now(),
				return_event_sent: false,
			};

			console.log( '💾 Storing new site starter choice:', choiceData );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, JSON.stringify( choiceData ) );
			console.log( '✅ Site starter choice stored successfully' );

			const verifyStored = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
			console.log( '🔍 Verification - stored value:', verifyStored );
		} catch ( error ) {
			console.error( '❌ Failed to store site starter choice:', error );
			this.handleStorageError( 'Failed to store site starter choice:', error );
		}
	}

	static checkAndSendReturnToStep4() {
		try {
			console.log( '🔍 checkAndSendReturnToStep4 called - checking for existing site starter choice...' );
			console.log( '🔍 Storage key being checked:', ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );

			const storedChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
			console.log( '🔍 Raw stored choice string:', storedChoiceString );

			if ( ! storedChoiceString ) {
				console.log( '❌ No stored site starter choice found - user has not made a previous choice' );
				return;
			}

			console.log( '✅ Found stored site starter choice, parsing...' );
			const choiceData = JSON.parse( storedChoiceString );
			console.log( '🔍 Parsed choice data:', {
				site_starter: choiceData.site_starter,
				timestamp: choiceData.timestamp,
				return_event_sent: choiceData.return_event_sent,
				timestampFormatted: new Date( choiceData.timestamp ).toISOString(),
			} );

			if ( ! choiceData.return_event_sent ) {
				console.log( '🚀 Return event not yet sent - sending core_onboarding_s4_return event...' );

				const returnEventPayload = {
					location: 'plugin_onboarding',
					trigger: 'user_returns_to_onboarding',
					step_number: 4,
					step_name: ONBOARDING_STEP_NAMES.SITE_STARTER,
					return_to_onboarding: choiceData.site_starter,
					original_choice_timestamp: choiceData.timestamp,
				};

				console.log( '🚀 Return event payload:', returnEventPayload );

				this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP4_RETURN_STEP4, returnEventPayload );

				console.log( '✅ Return event dispatched, marking as sent...' );
				choiceData.return_event_sent = true;
				const updatedChoiceData = JSON.stringify( choiceData );
				localStorage.setItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, updatedChoiceData );

				console.log( '✅ Updated choice data stored:', updatedChoiceData );
			} else {
				console.log( '⚠️ Return event already sent for this choice - skipping duplicate event' );
			}
		} catch ( error ) {
			console.error( '❌ Failed to check and send return to Step 4:', error );
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
		console.log( '🧹 clearStaleSessionData called - clearing stale onboarding localStorage keys' );

		// CRITICAL FIX: Don't clear pending events that should be sent after connection
		const keysToPreserve = [
			ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE,
			ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT,
			ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS,
			ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS,
			ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT,
			ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE,
		];

		const allKeys = Object.values( ONBOARDING_STORAGE_KEYS );
		const keysToRemove = allKeys.filter( ( key ) => ! keysToPreserve.includes( key ) );

		console.log( '🧹 Keys to preserve (pending events):', keysToPreserve );
		console.log( '🧹 Keys to remove (stale data):', keysToRemove );

		keysToRemove.forEach( ( key ) => {
			const existingValue = localStorage.getItem( key );
			if ( existingValue ) {
				console.log( `🧹 Removing key: ${ key }, existing value:`, existingValue );
			}
			localStorage.removeItem( key );
		} );

		// Log what was preserved
		keysToPreserve.forEach( ( key ) => {
			const existingValue = localStorage.getItem( key );
			if ( existingValue ) {
				console.log( `🔒 Preserved key: ${ key }, existing value:`, existingValue );
			}
		} );

		console.log( '✅ Stale session data cleared, pending events preserved' );
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
					location: 'editor',
					trigger: 'elementor_loaded',
					editor_loaded_from_onboarding_source: siteStarterChoice,
				} );
			}

			localStorage.setItem( ONBOARDING_STORAGE_KEYS.EDITOR_LOAD_TRACKED, 'true' );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT, '0' );
			this.setupPostOnboardingClickTracking();
		} catch ( error ) {
			this.handleStorageError( 'Failed to check and send editor loaded from onboarding:', error );
		}
	}

	static setupPostOnboardingClickTracking() {
		if ( 'undefined' === typeof document ) {
			return;
		}

		const handleClick = ( event ) => {
			this.trackPostOnboardingClick( event );
		};

		document.addEventListener( 'click', handleClick, true );
	}

	static trackPostOnboardingClick( event ) {
		try {
			const currentCount = parseInt( localStorage.getItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT ) || '0', 10 );

			if ( currentCount >= 3 ) {
				return;
			}

			const target = event.target;

			if ( ! this.shouldTrackClick( target ) ) {
				return;
			}

			const newCount = currentCount + 1;
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT, newCount.toString() );

			const clickData = this.extractClickData( target );
			const eventName = this.getClickEventName( newCount );

			if ( eventName ) {
				const siteStarterChoice = this.getSiteStarterChoice();

				this.dispatchEvent( eventName, {
					location: 'editor',
					trigger: 'click',
					editor_loaded_from_onboarding_source: siteStarterChoice,
					element_title: clickData.title,
					element_id: clickData.id,
					element_type: clickData.type,
				} );
			}

			if ( newCount >= 3 ) {
				this.cleanupPostOnboardingTracking();
			}
		} catch ( error ) {
			this.handleStorageError( 'Failed to track post-onboarding click:', error );
		}
	}

	static shouldTrackClick( element ) {
		const elementorEditor = element.closest( '#elementor-editor-wrapper, .elementor-panel, .elementor-control' );

		if ( ! elementorEditor ) {
			return false;
		}

		const excludedSelectors = [
			'.announcements-container',
			'.close-button',
			'.elementor-panel-header',
			'.elementor-panel-navigation',
			'.elementor-panel-menu',
		];

		for ( const selector of excludedSelectors ) {
			if ( element.closest( selector ) ) {
				return false;
			}
		}

		return true;
	}

	static extractClickData( element ) {
		const title = this.extractElementTitle( element );
		const id = element.id || '';
		const type = element.tagName?.toLowerCase() || '';

		return {
			title: title.substring( 0, 100 ),
			id,
			type,
		};
	}

	static extractElementTitle( element ) {
		const controlFieldContainer = element.closest( '.elementor-control-field' );

		if ( controlFieldContainer ) {
			const labelElement = controlFieldContainer.querySelector( 'label' );
			if ( labelElement && labelElement.textContent ) {
				return labelElement.textContent.trim();
			}
		}

		const elementorLabel = this.findElementorControlLabel( element );
		if ( elementorLabel ) {
			return elementorLabel;
		}

		return this.getFallbackElementTitle( element );
	}

	static getFallbackElementTitle( element ) {
		if ( 'select' === element.tagName?.toLowerCase() ) {
			return element.title || element.getAttribute( 'aria-label' ) || '';
		}

		return element.title || element.textContent?.trim() || element.getAttribute( 'aria-label' ) || '';
	}

	static findElementorControlLabel( element ) {
		const controlContainer = this.findElementorControlContainer( element );
		if ( ! controlContainer ) {
			return null;
		}

		return this.extractControlTitle( controlContainer );
	}

	static findElementorControlContainer( element ) {
		return element.closest( '.elementor-control' );
	}

	static extractControlTitle( controlContainer ) {
		const labelElement = controlContainer.querySelector( '.elementor-control-title' );

		if ( labelElement && labelElement.textContent ) {
			return labelElement.textContent.trim();
		}

		return null;
	}

	static getClickEventName( clickCount ) {
		switch ( clickCount ) {
			case 1:
				return ONBOARDING_EVENTS_MAP.POST_ONBOARDING_1ST_CLICK;
			case 2:
				return ONBOARDING_EVENTS_MAP.POST_ONBOARDING_2ND_CLICK;
			case 3:
				return ONBOARDING_EVENTS_MAP.POST_ONBOARDING_3RD_CLICK;
			default:
				return null;
		}
	}

	static cleanupPostOnboardingTracking() {
		try {
			document.removeEventListener( 'click', this.trackPostOnboardingClick );
		} catch ( error ) {
			this.handleStorageError( 'Failed to cleanup post-onboarding tracking:', error );
		}
	}

	static storeExitEventForLater( exitType, currentStep ) {
		try {
			console.log( '💾 storeExitEventForLater called:', { exitType, currentStep } );
			const exitData = {
				exitType,
				currentStep,
				timestamp: Date.now(),
			};

			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT, JSON.stringify( exitData ) );
			console.log( '💾 Exit event stored in localStorage:', exitData );

			this.attemptImmediateExitTracking( exitType, currentStep );
		} catch ( error ) {
			console.error( '❌ Failed to store exit event:', error );
			this.handleStorageError( 'Failed to store exit event:', error );
		}
	}

	static attemptImmediateExitTracking( exitType, currentStep ) {
		if ( ! elementorCommon.config.editor_events?.can_send_events ) {
			console.log( '❌ Cannot send events immediately, relying on stored event' );
			return;
		}

		try {
			const eventPayload = {
				location: 'plugin_onboarding',
				trigger: 'exit_action_detected',
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
				action_step: `${ exitType }/${ this.getStepName( currentStep ) }`,
				exit_timestamp: Date.now(),
			};

			console.log( '🚀 Attempting immediate exit tracking with sendBeacon:', eventPayload );

			if ( 'function' === typeof navigator.sendBeacon && elementorCommon.eventsManager?.getEndpoint ) {
				const endpoint = elementorCommon.eventsManager.getEndpoint();
				const success = navigator.sendBeacon( endpoint, JSON.stringify( {
					event: ONBOARDING_EVENTS_MAP.EXIT,
					data: eventPayload,
				} ) );

				if ( success ) {
					console.log( '✅ Exit event sent via sendBeacon successfully' );
					localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT );
					return;
				}
			}

			console.log( '📤 Fallback: Sending exit event via regular dispatch' );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.EXIT, eventPayload );
			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT );
		} catch ( error ) {
			console.error( '❌ Failed immediate exit tracking, keeping stored event:', error );
		}
	}

	static sendStoredExitEvent() {
		try {
			console.log( '📤 sendStoredExitEvent called - checking localStorage...' );
			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT );
			if ( ! storedDataString ) {
				console.log( '❌ No stored exit event found in localStorage' );
				return;
			}

			console.log( '📤 Found stored exit event:', storedDataString );
			const exitData = JSON.parse( storedDataString );
			const eventPayload = {
				location: 'plugin_onboarding',
				trigger: 'exit_action_detected',
				step_number: exitData.currentStep,
				step_name: this.getStepName( exitData.currentStep ),
				action_step: `${ exitData.exitType }/${ this.getStepName( exitData.currentStep ) }`,
				exit_timestamp: exitData.timestamp,
			};

			console.log( '📤 Sending core_onboarding_exit event:', eventPayload );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.EXIT, eventPayload );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT );
			console.log( '🗑️ Removed stored exit event from localStorage' );
		} catch ( error ) {
			console.error( '❌ Failed to send stored exit event:', error );
			this.handleStorageError( 'Failed to send stored exit event:', error );
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

	static setupWindowCloseTracking( currentStep ) {
		const handleWindowClose = ( event ) => {
			console.log( '🚪 Window close detected:', {
				type: event.type,
				currentStep,
				xButtonClicked: this.xButtonClicked,
			} );

			// Only track close_window if X button was NOT clicked
			if ( ! this.xButtonClicked ) {
				console.log( '✅ Tracking close_window - X button was not clicked' );
				this.storeExitEventForLater( 'close_window', currentStep );
			} else {
				console.log( '🚫 Skipping close_window tracking - X button was clicked' );
			}
		};

		const handleBeforeUnload = () => {
			console.log( '⚠️ Before unload detected:', {
				currentStep,
				xButtonClicked: this.xButtonClicked,
			} );

			// Only track close_window if X button was NOT clicked
			// Report as close_window instead of before_unload as requested
			if ( ! this.xButtonClicked ) {
				console.log( '✅ Tracking close_window (from beforeunload) - X button was not clicked' );
				this.storeExitEventForLater( 'close_window', currentStep );
			} else {
				console.log( '🚫 Skipping close_window tracking - X button was clicked' );
			}
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );
		window.addEventListener( 'pagehide', handleWindowClose );
		window.addEventListener( 'unload', handleWindowClose );

		console.log( '✅ Window close tracking setup completed for step:', currentStep );
	}

	static storeSkipEventForLater( currentStep ) {
		try {
			const skipData = {
				currentStep,
				timestamp: Date.now(),
			};
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
				location: 'plugin_onboarding',
				trigger: 'skip_clicked',
				step_number: skipData.currentStep,
				step_name: stepName,
				action_step: stepName,
				skip_timestamp: skipData.timestamp,
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_SKIP );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored skip event:', error );
		}
	}

	static sendOnboardingSkip( currentStep ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.SKIP, {
				location: 'plugin_onboarding',
				trigger: 'skip_clicked',
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
				action_step: currentStep,
			} );
		}
		this.storeSkipEventForLater( currentStep );
	}

	static sendTopUpgrade( currentStep, upgradeClicked ) {
		const canSendEvents = elementorCommon.config.editor_events?.can_send_events;
		console.log( '🔥 sendTopUpgrade called:', {
			currentStep,
			upgradeClicked,
			can_send_events: canSendEvents,
			editor_events_config: elementorCommon.config.editor_events,
		} );

		// CRITICAL VALIDATION: Don't process invalid step data
		if ( ! currentStep || '' === currentStep || null === currentStep || currentStep === undefined ) {
			console.log( '❌ sendTopUpgrade called with invalid currentStep - ignoring:', { currentStep, upgradeClicked } );
			return;
		}

		// ADDITIONAL VALIDATION: Ensure upgradeClicked is valid
		if ( ! upgradeClicked || '' === upgradeClicked ) {
			console.log( '❌ sendTopUpgrade called with invalid upgradeClicked - ignoring:', { currentStep, upgradeClicked } );
			return;
		}

		if ( canSendEvents ) {
			console.log( '✅ Sending TOP_UPGRADE immediately:', {
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
				upgrade_clicked: upgradeClicked,
			} );
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.TOP_UPGRADE, {
				location: 'plugin_onboarding',
				trigger: 'upgrade_interaction',
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
				action_step: currentStep,
				upgrade_clicked: upgradeClicked,
			} );
		}

		if ( 1 === currentStep ) {
			console.log( '💾 Storing TOP_UPGRADE for later:', { currentStep, upgradeClicked } );
			this.storeTopUpgradeEventForLater( currentStep, upgradeClicked );
		} else {
			console.log( '❌ Cannot send events and not step 1 - upgrade event lost:', { currentStep, upgradeClicked } );
		}
	}

	static sendCreateMyAccount( currentStep, createAccountClicked ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_MY_ACCOUNT, {
				location: 'plugin_onboarding',
				trigger: 'upgrade_interaction',
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
				action_step: currentStep,
				create_account_clicked: createAccountClicked,
			} );
		}
		this.storeCreateMyAccountEventForLater( currentStep, createAccountClicked );
	}

	static sendCreateAccountStatus( status, currentStep = 1 ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_ACCOUNT_STATUS, {
				location: 'plugin_onboarding',
				trigger: 'create_flow_returns_status',
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
				onboarding_create_account_status: status,
			} );
		}
		this.storeCreateAccountStatusEventForLater( status, currentStep );
	}

	static sendStep1ClickedConnect( currentStep = 1 ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP1_CLICKED_CONNECT, {
				location: 'plugin_onboarding',
				trigger: eventsConfig.triggers.click,
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
			} );
		}
		this.storeStep1ClickedConnectEventForLater( currentStep );
	}

	static storeTopUpgradeEventForLater( currentStep, upgradeClicked ) {
		try {
			console.log( '💾 storeTopUpgradeEventForLater called:', { currentStep, upgradeClicked } );

			// CRITICAL VALIDATION: Don't store invalid data
			if ( ! currentStep || '' === currentStep || null === currentStep || currentStep === undefined ) {
				console.log( '❌ storeTopUpgradeEventForLater - invalid currentStep, not storing:', { currentStep, upgradeClicked } );
				return;
			}

			if ( ! upgradeClicked || '' === upgradeClicked ) {
				console.log( '❌ storeTopUpgradeEventForLater - invalid upgradeClicked, not storing:', { currentStep, upgradeClicked } );
				return;
			}

			const existingDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
			const existingEvents = existingDataString ? JSON.parse( existingDataString ) : [];

			console.log( '💾 storeTopUpgradeEventForLater - existing events:', existingEvents );

			const eventData = {
				currentStep,
				upgradeClicked,
				timestamp: Date.now(),
			};

			existingEvents.push( eventData );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE, JSON.stringify( existingEvents ) );

			console.log( '💾 storeTopUpgradeEventForLater - storing events array:', existingEvents );

			// VERIFICATION: Confirm data was stored correctly
			const verifyStored = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
			console.log( '✅ storeTopUpgradeEventForLater - verification stored data:', verifyStored );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store top upgrade event:', error );
		}
	}

	static sendStoredTopUpgradeEvent() {
		try {
			console.log( '📤 sendStoredTopUpgradeEvent called - checking localStorage...' );
			console.log( '📤 Storage key being checked:', ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );

			const storedDataString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );

			console.log( '📤 sendStoredTopUpgradeEvent - stored data:', storedDataString );
			console.log( '📤 sendStoredTopUpgradeEvent - stored data type:', typeof storedDataString );
			console.log( '📤 sendStoredTopUpgradeEvent - stored data length:', storedDataString?.length );

			if ( ! storedDataString ) {
				console.log( '❌ No stored TOP_UPGRADE data found' );
				console.log( '🔍 DEBUG: All localStorage keys containing "onboarding":' );
				for ( let i = 0; i < localStorage.length; i++ ) {
					const key = localStorage.key( i );
					if ( key && key.includes( 'onboarding' ) ) {
						console.log( `🔍   ${ key }: ${ localStorage.getItem( key ) }` );
					}
				}
				return;
			}

			const storedEvents = JSON.parse( storedDataString );
			const eventsArray = Array.isArray( storedEvents ) ? storedEvents : [ storedEvents ];

			console.log( '📤 sendStoredTopUpgradeEvent - processing events:', eventsArray );

			eventsArray.forEach( ( eventData, index ) => {
				console.log( `📤 Sending stored TOP_UPGRADE event ${ index + 1 }:`, {
					step_number: eventData.currentStep,
					step_name: this.getStepName( eventData.currentStep ),
					upgrade_clicked: eventData.upgradeClicked,
					timestamp: eventData.timestamp,
				} );

				this.dispatchEvent( ONBOARDING_EVENTS_MAP.TOP_UPGRADE, {
					location: 'plugin_onboarding',
					trigger: 'upgrade_interaction',
					step_number: eventData.currentStep,
					step_name: this.getStepName( eventData.currentStep ),
					action_step: eventData.currentStep,
					upgrade_clicked: eventData.upgradeClicked,
					event_timestamp: eventData.timestamp,
				} );
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
			console.log( '🗑️ Removed stored TOP_UPGRADE events from localStorage' );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored top upgrade event:', error );
		}
	}

	static storeCreateMyAccountEventForLater( currentStep, createAccountClicked ) {
		try {
			const eventData = {
				currentStep,
				createAccountClicked,
				timestamp: Date.now(),
			};
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
				location: 'plugin_onboarding',
				trigger: 'upgrade_interaction',
				step_number: eventData.currentStep,
				step_name: this.getStepName( eventData.currentStep ),
				action_step: eventData.currentStep,
				create_account_clicked: eventData.createAccountClicked,
				event_timestamp: eventData.timestamp,
			} );

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
				timestamp: Date.now(),
				timeoutId: setTimeout( () => {
					this.sendDelayedNoClickEvent();
				}, delay ),
			};
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE_NO_CLICK, JSON.stringify( {
				currentStep: eventData.currentStep,
				timestamp: eventData.timestamp,
			} ) );
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
				timestamp: Date.now(),
			};
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
				location: 'plugin_onboarding',
				trigger: 'create_flow_returns_status',
				step_number: eventData.currentStep,
				step_name: this.getStepName( eventData.currentStep ),
				onboarding_create_account_status: eventData.status,
				event_timestamp: eventData.timestamp,
			} );

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
				timestamp: Date.now(),
			};
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
				location: 'plugin_onboarding',
				trigger: 'connect_flow_returns_status',
				step_number: 1,
				step_name: ONBOARDING_STEP_NAMES.CONNECT,
				onboarding_connect_status: eventData.status,
				tracking_opted_in: eventData.trackingOptedIn,
				user_tier: eventData.userTier,
				event_timestamp: eventData.timestamp,
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored connect status event:', error );
		}
	}

	static storeStep1ClickedConnectEventForLater( currentStep ) {
		try {
			const eventData = {
				currentStep,
				timestamp: Date.now(),
			};
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT, JSON.stringify( eventData ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store step1 clicked connect event:', error );
		}
	}

	static storeStep1EndStateForLater( eventData, storageKey ) {
		try {
			const storedEventData = {
				...eventData,
				timestamp: Date.now(),
			};
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
				location: 'plugin_onboarding',
				trigger: eventsConfig.triggers.click,
				step_number: eventData.currentStep,
				step_name: this.getStepName( eventData.currentStep ),
				event_timestamp: eventData.timestamp,
			} );

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
				event_timestamp: eventData.timestamp,
			} );

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
		console.log( '🔍 setupAllUpgradeButtons called:', { currentStep, selector } );
		const upgradeButtons = document.querySelectorAll( selector );
		console.log( '🔍 Found upgrade buttons:', { count: upgradeButtons.length, buttons: Array.from( upgradeButtons ).map( ( b ) => ( { className: b.className, id: b.id, tagName: b.tagName } ) ) } );

		const cleanupFunctions = [];

		upgradeButtons.forEach( ( button, index ) => {
			console.log( `🔍 Setting up button ${ index + 1 }:`, { className: button.className, id: button.id } );
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
			console.log( '❌ setupSingleUpgradeButton: buttonElement is null/undefined' );
			return null;
		}

		console.log( '🎯 setupSingleUpgradeButton:', { currentStep, buttonElement: { className: buttonElement.className, id: buttonElement.id, tagName: buttonElement.tagName } } );

		let hasHovered = false;
		let hasClicked = false;

		const handleMouseEnter = () => {
			console.log( '🖱️ Mouse enter on upgrade button:', { currentStep, buttonClass: buttonElement.className } );
			hasHovered = true;
		};

		const handleMouseLeave = () => {
			console.log( '🖱️ Mouse leave on upgrade button:', { currentStep, hasHovered, hasClicked, buttonClass: buttonElement.className } );
			if ( hasHovered && ! hasClicked ) {
				console.log( '⏰ Scheduling delayed no-click event from mouse leave' );
				this.scheduleDelayedNoClickEvent( currentStep );
				hasHovered = false;
			}
		};

		const handleClick = () => {
			console.log( '🖱️ Click on upgrade button:', { currentStep, buttonClass: buttonElement.className } );
			hasClicked = true;
			this.cancelDelayedNoClickEvent();

			const upgradeClickedValue = this.determineUpgradeClickedValue( buttonElement );
			console.log( '🎯 Determined upgrade clicked value:', { upgradeClickedValue, buttonClass: buttonElement.className } );
			this.sendTopUpgrade( currentStep, upgradeClickedValue );
		};

		buttonElement.addEventListener( 'mouseenter', handleMouseEnter );
		buttonElement.addEventListener( 'mouseleave', handleMouseLeave );
		buttonElement.addEventListener( 'click', handleClick );

		console.log( '✅ Event listeners added to button:', { className: buttonElement.className, id: buttonElement.id } );

		return () => {
			buttonElement.removeEventListener( 'mouseenter', handleMouseEnter );
			buttonElement.removeEventListener( 'mouseleave', handleMouseLeave );
			buttonElement.removeEventListener( 'click', handleClick );
			console.log( '🧹 Event listeners removed from button:', { className: buttonElement.className, id: buttonElement.id } );
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
		console.log( '🎯 setupTopUpgradeTracking called:', { currentStep } );
		return this.setupAllUpgradeButtons( currentStep );
	}

	static setupSingleUpgradeButtonTracking( buttonElement, currentStep ) {
		return this.setupSingleUpgradeButton( buttonElement, currentStep );
	}

	static trackExitAndSendEndState( currentStep ) {
		console.log( '🚪 trackExitAndSendEndState called:', { currentStep } );
		this.trackStepAction( currentStep, 'exit' );
		console.log( '📊 Sending step end state for exit...' );
		this.sendStepEndState( currentStep );
	}

	static trackStepActionInternal( stepNumber, action, storageKey, additionalData = {} ) {
		try {
			console.log( `📝 trackStepActionInternal called for step ${ stepNumber }:`, {
				stepNumber,
				action,
				storageKey,
				additionalData,
			} );

			const currentTime = Date.now();
			const existingActions = this.getStoredActions( storageKey );
			const actionData = {
				action,
				timestamp: currentTime,
				...additionalData,
			};

			console.log( `📝 Adding action to step ${ stepNumber }:`, {
				actionData,
				existingActionsCount: existingActions.length,
				currentTimeFormatted: new Date( currentTime ).toISOString(),
			} );

			existingActions.push( actionData );
			localStorage.setItem( storageKey, JSON.stringify( existingActions ) );

			console.log( `✅ Step ${ stepNumber } action stored successfully. Total actions: ${ existingActions.length }` );
		} catch ( error ) {
			console.error( `❌ Failed to track Step ${ stepNumber } action:`, error );
			this.handleStorageError( `Failed to track Step ${ stepNumber } action:`, error );
		}
	}

	static sendStepEndStateInternal( stepNumber, storageKey, eventName, stepName, endStateProperty ) {
		try {
			console.log( `📊 sendStepEndStateInternal called for step ${ stepNumber }:`, {
				stepNumber,
				storageKey,
				eventName,
				stepName,
				endStateProperty,
			} );

			const actionsString = localStorage.getItem( storageKey );
			const startTimeString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );

			console.log( `📊 Step ${ stepNumber } end state data from localStorage:`, {
				actionsString,
				startTimeString,
				hasActions: !! actionsString,
				hasStartTime: !! startTimeString,
			} );

			if ( ! actionsString ) {
				console.log( `❌ No actions found for step ${ stepNumber }, cannot send end state` );
				return;
			}

			const actions = JSON.parse( actionsString );
			const eventData = {
				location: 'plugin_onboarding',
				trigger: 'user_redirects_out_of_step',
				step_number: stepNumber,
				step_name: stepName,
			};

			if ( startTimeString ) {
				const startTime = parseInt( startTimeString, 10 );
				const currentTime = Date.now();
				const totalTimeSpent = Math.round( ( currentTime - startTime ) / 1000 );
				eventData.total_time_spent = `${ totalTimeSpent }s`;

				console.log( `⏱️ Total time spent calculation for step ${ stepNumber }:`, {
					startTime,
					currentTime,
					totalTimeSpent,
					startTimeFormatted: new Date( startTime ).toISOString(),
					currentTimeFormatted: new Date( currentTime ).toISOString(),
				} );
			} else {
				console.log( `❌ No start time found for total time calculation in step ${ stepNumber }` );
			}

			const stepTimeSpent = this.calculateStepTimeSpent( stepNumber );
			if ( stepTimeSpent !== null ) {
				eventData.step_time_spent = `${ stepTimeSpent }s`;
				console.log( `⏱️ Step time spent added to event data: ${ stepTimeSpent }s` );
			} else {
				console.log( `❌ No step time spent calculated for step ${ stepNumber }` );
			}

			eventData[ endStateProperty ] = actions;

			console.log( `📊 Final event data for step ${ stepNumber }:`, eventData );

			if ( elementorCommon.config.editor_events?.can_send_events ) {
				console.log( `✅ Sending step ${ stepNumber } end state event immediately` );
				this.dispatchEvent( eventName, eventData );
				localStorage.removeItem( storageKey );
				this.clearStepStartTime( stepNumber );
			} else if ( 1 === stepNumber ) {
				console.log( `💾 Storing step ${ stepNumber } end state for later (cannot send events)` );
				this.storeStep1EndStateForLater( eventData, storageKey );
			} else {
				console.log( `⚠️ Cannot send events but not step 1 - sending anyway for step ${ stepNumber }` );
				this.dispatchEvent( eventName, eventData );
				localStorage.removeItem( storageKey );
				this.clearStepStartTime( stepNumber );
			}
		} catch ( error ) {
			console.error( `❌ Failed to send Step ${ stepNumber } end state:`, error );
			this.handleStorageError( `Failed to send Step ${ stepNumber } end state:`, error );
		}
	}

	static calculateTimeSpent() {
		console.log( '⏱️ calculateTimeSpent called' );
		const startTimeString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );
		console.log( '⏱️ startTimeString from localStorage:', startTimeString );

		if ( ! startTimeString ) {
			console.log( '❌ No start time found in localStorage' );
			return null;
		}

		const startTime = parseInt( startTimeString, 10 );
		const currentTime = Date.now();
		const timeSpent = Math.round( ( currentTime - startTime ) / 1000 );

		console.log( '⏱️ Time calculation:', {
			startTime,
			currentTime,
			timeSpent,
			startTimeFormatted: new Date( startTime ).toISOString(),
			currentTimeFormatted: new Date( currentTime ).toISOString(),
		} );

		return { startTime, currentTime, timeSpent };
	}

	static trackStepStartTime( stepNumber ) {
		try {
			console.log( `⏱️ trackStepStartTime called for step ${ stepNumber }` );
			const stepStartTimeKey = this.getStepStartTimeKey( stepNumber );
			const currentTime = Date.now();

			const existingStartTime = localStorage.getItem( stepStartTimeKey );
			if ( existingStartTime ) {
				console.log( `⏱️ Step ${ stepNumber } start time already exists:`, {
					existing: existingStartTime,
					existingFormatted: new Date( parseInt( existingStartTime, 10 ) ).toISOString(),
					new: currentTime,
					newFormatted: new Date( currentTime ).toISOString(),
				} );
				console.log( `⏱️ Keeping existing start time for step ${ stepNumber }` );
				return;
			}

			console.log( `⏱️ Setting step ${ stepNumber } start time:`, {
				stepStartTimeKey,
				currentTime,
				currentTimeFormatted: new Date( currentTime ).toISOString(),
			} );

			localStorage.setItem( stepStartTimeKey, currentTime.toString() );

			const verifyStored = localStorage.getItem( stepStartTimeKey );
			console.log( `✅ Step ${ stepNumber } start time stored successfully:`, {
				stored: verifyStored,
				storedFormatted: new Date( parseInt( verifyStored, 10 ) ).toISOString(),
			} );
		} catch ( error ) {
			console.error( `❌ Failed to track step ${ stepNumber } start time:`, error );
			this.handleStorageError( `Failed to track step ${ stepNumber } start time:`, error );
		}
	}

	static calculateStepTimeSpent( stepNumber ) {
		try {
			console.log( `⏱️ calculateStepTimeSpent called for step ${ stepNumber }` );
			const stepStartTimeKey = this.getStepStartTimeKey( stepNumber );
			const stepStartTimeString = localStorage.getItem( stepStartTimeKey );

			console.log( `⏱️ Step ${ stepNumber } start time from localStorage:`, {
				stepStartTimeKey,
				stepStartTimeString,
			} );

			if ( ! stepStartTimeString ) {
				console.log( `❌ No start time found for step ${ stepNumber }` );
				return null;
			}

			const stepStartTime = parseInt( stepStartTimeString, 10 );
			const currentTime = Date.now();
			const stepTimeSpent = Math.round( ( currentTime - stepStartTime ) / 1000 );

			console.log( `⏱️ Step ${ stepNumber } time calculation:`, {
				stepStartTime,
				currentTime,
				stepTimeSpent,
				stepStartTimeFormatted: new Date( stepStartTime ).toISOString(),
				currentTimeFormatted: new Date( currentTime ).toISOString(),
			} );

			return stepTimeSpent;
		} catch ( error ) {
			console.error( `❌ Failed to calculate step ${ stepNumber } time:`, error );
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
		const stepMapping = {
			account: 1,
			hello: 2,
			chooseFeatures: 3,
			goodToGo: 4,
			siteName: 5,
			siteLogo: 6,
		};
		return stepMapping[ pageId ] || null;
	}

	static getStepConfig( stepNumber ) {
		const stepConfigs = {
			1: {
				actionsKey: ONBOARDING_STORAGE_KEYS.STEP1_ACTIONS,
				eventName: ONBOARDING_EVENTS_MAP.STEP1_END_STATE,
				stepName: ONBOARDING_STEP_NAMES.CONNECT,
				endStateProperty: 's1_end_state',
			},
			2: {
				actionsKey: ONBOARDING_STORAGE_KEYS.STEP2_ACTIONS,
				eventName: ONBOARDING_EVENTS_MAP.STEP2_END_STATE,
				stepName: ONBOARDING_STEP_NAMES.HELLO_BIZ,
				endStateProperty: 's2_end_state',
			},
			3: {
				actionsKey: ONBOARDING_STORAGE_KEYS.STEP3_ACTIONS,
				eventName: ONBOARDING_EVENTS_MAP.STEP3_END_STATE,
				stepName: ONBOARDING_STEP_NAMES.PRO_FEATURES,
				endStateProperty: 's3_end_state',
			},
			4: {
				actionsKey: ONBOARDING_STORAGE_KEYS.STEP4_ACTIONS,
				eventName: ONBOARDING_EVENTS_MAP.STEP4_END_STATE,
				stepName: ONBOARDING_STEP_NAMES.SITE_STARTER,
				endStateProperty: 's4_end_state',
			},
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
		console.log( '🎯 handleStep4CardClick called:', {
			timestamp: Date.now(),
			timestampFormatted: new Date().toISOString(),
		} );

		const hasPreviousClick = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK );
		console.log( '🔍 Checking for previous step 4 click:', {
			hasPreviousClick,
			storageKey: ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK,
		} );

		if ( hasPreviousClick ) {
			console.log( '🚀 Previous click detected - sending return to step 4 event BEFORE normal action...' );

			const returnEventPayload = {
				location: 'plugin_onboarding',
				trigger: 'user_returns_to_step4_card_click',
				step_number: 4,
				step_name: ONBOARDING_STEP_NAMES.SITE_STARTER,
				return_detected_via: 'card_click_detection',
				timestamp: Date.now(),
			};

			console.log( '🚀 Return to step 4 event payload:', returnEventPayload );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP4_RETURN_STEP4, returnEventPayload );
		} else {
			console.log( '✨ First click on step 4 cards - marking as clicked for future detection' );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK, 'true' );

			const verifyStored = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_HAS_PREVIOUS_CLICK );
			console.log( '✅ Step 4 previous click flag stored:', verifyStored );
		}

		console.log( '✅ handleStep4CardClick completed - normal card action will proceed' );
	}

	static handleSiteStarterChoice( siteStarter ) {
		console.log( '🎯 handleSiteStarterChoice called:', {
			siteStarter,
			timestamp: Date.now(),
			timestampFormatted: new Date().toISOString(),
		} );

		console.log( '⏱️ Step 0: Ensuring step 4 start time is tracked...' );
		this.trackStepStartTime( 4 );

		console.log( '💾 Step 1: Storing site starter choice...' );
		this.storeSiteStarterChoice( siteStarter );

		console.log( '📝 Step 2: Tracking step action...' );
		this.trackStepAction( 4, 'site_starter', {
			site_starter: siteStarter,
		} );

		console.log( '📊 Step 3: Sending step end state...' );
		this.sendStepEndState( 4 );

		console.log( '✅ handleSiteStarterChoice completed for:', siteStarter );
	}

	static sendAllStoredEvents() {
		console.log( '📤 sendAllStoredEvents called - sending all stored events...' );
		this.sendStoredExitEvent();
		this.sendStoredSkipEvent();
		this.sendStoredConnectStatusEvent();
		this.sendStoredTopUpgradeEvent();
		this.sendStoredCreateMyAccountEvent();
		this.sendStoredCreateAccountStatusEvent();
		this.sendStoredStep1ClickedConnectEvent();
		this.sendStoredStep1EndStateEvent();
		console.log( '✅ sendAllStoredEvents completed' );
	}

	static sendStoredStep1EventsOnStep2() {
		this.sendStoredTopUpgradeEvent();
	}

	static onStepLoad( currentStep ) {
		console.log( `🔄 onStepLoad called:`, {
			currentStep,
			currentUrl: window.location.href,
			timestamp: Date.now(),
			timestampFormatted: new Date().toISOString(),
		} );

		// Reset X button state for new step to ensure clean tracking
		this.resetXButtonState();

		const stepNumber = this.getStepNumber( currentStep );
		console.log( `🔄 Step number resolved:`, { currentStep, stepNumber } );

		if ( stepNumber ) {
			console.log( `⏱️ Tracking start time for step ${ stepNumber }` );
			this.trackStepStartTime( stepNumber );
		} else {
			console.log( `❌ No step number found for currentStep: ${ currentStep }` );
		}

		if ( 2 === currentStep || 'hello' === currentStep ) {
			console.log( `📤 Sending stored step 1 events on step 2 load` );
			this.sendStoredStep1EventsOnStep2();
		}

		if ( 4 === stepNumber || 'goodToGo' === currentStep ) {
			console.log( `🎯 Step 4 (Site Starter) loaded - checking for return to step 4 scenario...` );
			console.log( `🎯 Current step details:`, { currentStep, stepNumber } );
			console.log( `🎯 URL analysis:`, {
				href: window.location.href,
				pathname: window.location.pathname,
				search: window.location.search,
				hash: window.location.hash,
			} );

			this.debugReturnToStep4Scenario();
			this.checkAndSendReturnToStep4();
		}
	}

	static debugLocalStorageState() {
		console.log( '🔍 DEBUG: Current localStorage state for onboarding:' );

		Object.entries( ONBOARDING_STORAGE_KEYS ).forEach( ( [ keyName, keyValue ] ) => {
			const storedValue = localStorage.getItem( keyValue );
			console.log( `🔍 ${ keyName } (${ keyValue }):`, storedValue );

			if ( storedValue && keyValue.includes( 'TIME' ) ) {
				try {
					const timestamp = parseInt( storedValue, 10 );
					console.log( `🔍   → Formatted: ${ new Date( timestamp ).toISOString() }` );
				} catch ( e ) {
					console.log( `🔍   → Invalid timestamp format` );
				}
			}

			if ( storedValue && ( keyValue.includes( 'ACTIONS' ) || keyValue.includes( 'PENDING' ) ) ) {
				try {
					const parsed = JSON.parse( storedValue );
					console.log( `🔍   → Parsed:`, parsed );
				} catch ( e ) {
					console.log( `🔍   → Invalid JSON format` );
				}
			}
		} );

		console.log( '🔍 DEBUG: localStorage state complete' );
	}

	static debugReturnToStep4Scenario() {
		console.log( '🎯 DEBUG: Return to Step 4 scenario analysis' );
		console.log( '🎯 ========================================' );

		const storedChoiceString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		console.log( '🎯 Step 4 site starter choice storage key:', ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE );
		console.log( '🎯 Raw stored value:', storedChoiceString );

		if ( storedChoiceString ) {
			try {
				const choiceData = JSON.parse( storedChoiceString );
				console.log( '🎯 Parsed choice data:', {
					site_starter: choiceData.site_starter,
					timestamp: choiceData.timestamp,
					return_event_sent: choiceData.return_event_sent,
					timestampFormatted: new Date( choiceData.timestamp ).toISOString(),
					timeSinceChoice: Math.round( ( Date.now() - choiceData.timestamp ) / 1000 ) + 's',
				} );

				if ( choiceData.return_event_sent ) {
					console.log( '🎯 ✅ Return event has already been sent for this choice' );
				} else {
					console.log( '🎯 ⚠️ Return event has NOT been sent yet - should trigger on next step 4 load' );
				}
			} catch ( error ) {
				console.error( '🎯 ❌ Failed to parse stored choice data:', error );
			}
		} else {
			console.log( '🎯 ❌ No site starter choice found - user has not made any choice yet' );
		}

		const currentUrl = window.location.href;
		const isOnStep4 = currentUrl.includes( 'goodToGo' ) || currentUrl.includes( 'step4' ) || currentUrl.includes( 'site_starter' );
		console.log( '🎯 Current URL analysis:', {
			url: currentUrl,
			isOnStep4,
			urlContainsGoodToGo: currentUrl.includes( 'goodToGo' ),
			urlContainsStep4: currentUrl.includes( 'step4' ),
			urlContainsSiteStarter: currentUrl.includes( 'site_starter' ),
		} );

		console.log( '🎯 Event tracking configuration:', {
			canSendEvents: elementorCommon.config.editor_events?.can_send_events,
			eventsManagerAvailable: !! elementorCommon.eventsManager,
			dispatchEventAvailable: 'function' === typeof elementorCommon.eventsManager?.dispatchEvent,
		} );

		console.log( '🎯 ========================================' );
	}

	static handleStorageError( message, error ) {
		console.error( message, error );
		console.log( '🔍 Debugging localStorage state after error:' );
		this.debugLocalStorageState();
	}
}

export { ONBOARDING_STORAGE_KEYS, ONBOARDING_STEP_NAMES };
