/* eslint-disable no-console */
import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';
import { options } from './utils';

console.log( '🚀 OnboardingEventTracking loaded with EXIT DEBUGGING!' );

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
			const choiceData = {
				site_starter: siteStarter,
				timestamp: Date.now(),
				return_event_sent: false,
			};
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, JSON.stringify( choiceData ) );
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
				this.dispatchEvent( ONBOARDING_EVENTS_MAP.STEP4_RETURN_STEP4, {
					location: 'plugin_onboarding',
					trigger: 'user_returns_to_onboarding',
					step_number: 4,
					step_name: ONBOARDING_STEP_NAMES.SITE_STARTER,
					return_to_onboarding: choiceData.site_starter,
					original_choice_timestamp: choiceData.timestamp,
				} );

				choiceData.return_event_sent = true;
				localStorage.setItem( ONBOARDING_STORAGE_KEYS.STEP4_SITE_STARTER_CHOICE, JSON.stringify( choiceData ) );
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
		Object.values( ONBOARDING_STORAGE_KEYS ).forEach( ( key ) => {
			localStorage.removeItem( key );
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

			const newCount = currentCount + 1;
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.POST_ONBOARDING_CLICK_COUNT, newCount.toString() );

			const target = event.target;
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
		const elementorLabel = this.findElementorControlLabel( element );
		if ( elementorLabel ) {
			return elementorLabel;
		}
		
		return this.getFallbackElementTitle( element );
	}

	static getFallbackElementTitle( element ) {
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
		} catch ( error ) {
			console.error( '❌ Failed to store exit event:', error );
			this.handleStorageError( 'Failed to store exit event:', error );
		}
	}

	static sendStoredExitEvent() {
		try {
			console.log( '📤 sendStoredExitEvent called - checking localStorage...' );
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT );
			if ( ! storedDataStr ) {
				console.log( '❌ No stored exit event found in localStorage' );
				return;
			}

			console.log( '📤 Found stored exit event:', storedDataStr );
			const exitData = JSON.parse( storedDataStr );
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
		const handleWindowClose = () => {
			this.storeExitEventForLater( 'close_window', currentStep );
		};

		window.addEventListener( 'beforeunload', handleWindowClose );
		window.addEventListener( 'pagehide', handleWindowClose );
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
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_SKIP );
			if ( ! storedDataStr ) {
				return;
			}

			const skipData = JSON.parse( storedDataStr );
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
		if ( elementorCommon.config.editor_events?.can_send_events ) {
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
			this.storeTopUpgradeEventForLater( currentStep, upgradeClicked );
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
			const existingEvents = existingDataStr ? JSON.parse( existingDataStr ) : [];

			const eventData = {
				currentStep,
				upgradeClicked,
				timestamp: Date.now(),
			};

			existingEvents.push( eventData );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE, JSON.stringify( existingEvents ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store top upgrade event:', error );
		}
	}

	static sendStoredTopUpgradeEvent() {
		try {
			if ( ! storedDataStr ) {
				return;
			}

			const storedEvents = JSON.parse( storedDataStr );
			const eventsArray = Array.isArray( storedEvents ) ? storedEvents : [ storedEvents ];

			eventsArray.forEach( ( eventData ) => {
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
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );
			if ( ! storedDataStr ) {
				return;
			}

			const eventData = JSON.parse( storedDataStr );
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
			if ( currentStep !== 1 ) {
				return;
			}

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
			if ( ! storedDataStr ) {
				return;
			}

			const eventData = JSON.parse( storedDataStr );
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
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_ACCOUNT_STATUS );
			if ( ! storedDataStr ) {
				return;
			}

			const eventData = JSON.parse( storedDataStr );
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
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_CONNECT_STATUS );
			if ( ! storedDataStr ) {
				return;
			}

			const eventData = JSON.parse( storedDataStr );
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
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_CLICKED_CONNECT );
			if ( ! storedDataStr ) {
				return;
			}

			const eventData = JSON.parse( storedDataStr );
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
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_STEP1_END_STATE );
			if ( ! storedDataStr ) {
				return;
			}

			const eventData = JSON.parse( storedDataStr );
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
			const currentTime = Date.now();
			const existingActions = this.getStoredActions( storageKey );
			const actionData = {
				action,
				timestamp: currentTime,
				...additionalData,
			};

			existingActions.push( actionData );
			localStorage.setItem( storageKey, JSON.stringify( existingActions ) );
		} catch ( error ) {
			this.handleStorageError( `Failed to track Step ${ stepNumber } action:`, error );
		}
	}

	static sendStepEndStateInternal( stepNumber, storageKey, eventName, stepName, endStateProperty ) {
		try {
			const actionsString = localStorage.getItem( storageKey );
			const startTimeString = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );

			if ( ! actionsString ) {
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
			}

			const stepTimeSpent = this.calculateStepTimeSpent( stepNumber );
			if ( stepTimeSpent !== null ) {
				eventData.step_time_spent = `${ stepTimeSpent }s`;
			}

			eventData[ endStateProperty ] = actions;

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

		return { startTime, currentTime, timeSpent };
	}

	static trackStepStartTime( stepNumber ) {
		try {
			const stepStartTimeKey = this.getStepStartTimeKey( stepNumber );
			const currentTime = Date.now();
			localStorage.setItem( stepStartTimeKey, currentTime.toString() );
		} catch ( error ) {
			this.handleStorageError( `Failed to track step ${ stepNumber } start time:`, error );
		}
	}

	static calculateStepTimeSpent( stepNumber ) {
		try {
			const stepStartTimeKey = this.getStepStartTimeKey( stepNumber );
			const stepStartTimeString = localStorage.getItem( stepStartTimeKey );

			if ( ! stepStartTimeString ) {
				return null;
			}

			const stepStartTime = parseInt( stepStartTimeString, 10 );
			const currentTime = Date.now();
			const stepTimeSpent = Math.round( ( currentTime - stepStartTime ) / 1000 );

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

	static handleSiteStarterChoice( siteStarter ) {
		this.storeSiteStarterChoice( siteStarter );
		this.trackStepAction( 4, 'site_starter', {
			site_starter: siteStarter,
		} );
		this.sendStepEndState( 4 );
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
		const stepNumber = this.getStepNumber( currentStep );
		if ( stepNumber ) {
			this.trackStepStartTime( stepNumber );
		}

		if ( 2 === currentStep || 'hello' === currentStep ) {
			this.sendStoredStep1EventsOnStep2();
		}
	}

	static handleStorageError( message, error ) {
		// eslint-disable-next-line no-console
		console.warn( message, error );
	}
}

export { ONBOARDING_STORAGE_KEYS, ONBOARDING_STEP_NAMES };
