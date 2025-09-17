import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';

const ONBOARDING_EVENTS_MAP = {
	UPGRADE_NOW_S3: 'core_onboarding_s3_upgrade_now',
	HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz',
	CORE_ONBOARDING: 'core_onboarding',
	CONNECT_STATUS: 'core_onboarding_connect_status',
	S1_END_STATE: 'core_onboarding_s1_end_state',
	S2_END_STATE: 'core_onboarding_s2_end_state',
	EXIT: 'core_onboarding_exit',
	SKIP: 'core_onboarding_skip',
	CREATE_MY_ACCOUNT: 'core_onboarding_s1_create_my_account',
	CREATE_ACCOUNT_STATUS: 'core_onboarding_create_account_status',
};

const ONBOARDING_STORAGE_KEYS = {
	START_TIME: 'elementor_onboarding_start_time',
	INITIATED: 'elementor_onboarding_initiated',
	S1_ACTIONS: 'elementor_onboarding_s1_actions',
	S2_ACTIONS: 'elementor_onboarding_s2_actions',
	PENDING_EXIT: 'elementor_onboarding_pending_exit',
	PENDING_SKIP: 'elementor_onboarding_pending_skip',
	PENDING_CREATE_ACCOUNT_STATUS: 'elementor_onboarding_pending_create_account_status',
	PENDING_CREATE_MY_ACCOUNT: 'elementor_onboarding_pending_create_my_account',
	PENDING_TOP_UPGRADE: 'elementor_onboarding_pending_top_upgrade',
};

export class OnboardingEventTracking {
	static dispatchEvent( eventName, payload ) {
		if ( ! elementorCommon.config.editor_events?.can_send_events ) {
			return;
		}

		return elementorCommon.eventsManager.dispatchEvent( eventName, payload );
	}

	static sendUpgradeNowStep3( selectedFeatures, currentStep ) {
		const proFeaturesChecked = this.extractSelectedFeatureTitles( selectedFeatures );
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.UPGRADE_NOW_S3, {
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.click,
			step_number: currentStep,
			step_name: 'choose_features',
			pro_features_checked: proFeaturesChecked,
		} );
	}

	static extractSelectedFeatureTitles( selectedFeatures ) {
		const allSelected = [];
		if ( selectedFeatures.essential ) {
			allSelected.push( ...selectedFeatures.essential );
		}
		if ( selectedFeatures.advanced ) {
			allSelected.push( ...selectedFeatures.advanced );
		}
		return allSelected;
	}

	static sendHelloBizContinue( stepNumber = 2 ) {
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.HELLO_BIZ_CONTINUE, {
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.click,
			step_number: stepNumber,
			step_name: 'hello_biz_theme',
		} );
	}

	static initiateCoreOnboarding() {
		const startTime = Date.now();

		try {
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
			step_name: 'onboarding_start',
			onboarding_start_time: startTime,
			total_onboarding_time_seconds: totalOnboardingTime,
		} );

		try {
			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.START_TIME );
			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.INITIATED );
		} catch ( error ) {
			this.handleStorageError( 'Failed to clear onboarding storage:', error );
		}
	}

	static sendConnectStatus( status, trackingOptedIn = false, userTier = null ) {
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CONNECT_STATUS, {
			location: 'plugin_onboarding',
			trigger: 'connect_flow_returns_status',
			step_number: 1,
			step_name: 'account_setup',
			onboarding_connect_status: status,
			tracking_opted_in: trackingOptedIn,
			user_tier: userTier,
		} );
	}

	static trackS1Action( action ) {
		try {
			const startTimeStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );
			if ( ! startTimeStr ) {
				return;
			}

			const startTime = parseInt( startTimeStr, 10 );
			const currentTime = Date.now();
			const timeSpent = Math.round( ( currentTime - startTime ) / 1000 );

			const existingActionsStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.S1_ACTIONS );
			const existingActions = existingActionsStr ? JSON.parse( existingActionsStr ) : [];

			const actionData = {
				action,
				timestamp: currentTime,
				time_spent: timeSpent,
			};

			existingActions.push( actionData );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.S1_ACTIONS, JSON.stringify( existingActions ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to track S1 action:', error );
		}
	}

	static sendS1EndState() {
		try {
			const actionsStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.S1_ACTIONS );
			const startTimeStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );

			if ( ! actionsStr || ! startTimeStr ) {
				return;
			}

			const actions = JSON.parse( actionsStr );
			const startTime = parseInt( startTimeStr, 10 );
			const currentTime = Date.now();
			const totalTimeSpent = Math.round( ( currentTime - startTime ) / 1000 );

			this.dispatchEvent( ONBOARDING_EVENTS_MAP.S1_END_STATE, {
				location: 'plugin_onboarding',
				trigger: 'user_redirects_out_of_step',
				step_number: 1,
				step_name: 'account_setup',
				s1_end_state: actions,
				total_time_spent: totalTimeSpent,
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.S1_ACTIONS );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send S1 end state:', error );
		}
	}

	static trackS2Action( action ) {
		try {
			const startTimeStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );
			if ( ! startTimeStr ) {
				return;
			}

			const startTime = parseInt( startTimeStr, 10 );
			const currentTime = Date.now();
			const timeSpent = Math.round( ( currentTime - startTime ) / 1000 );

			const existingActionsStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.S2_ACTIONS );
			const existingActions = existingActionsStr ? JSON.parse( existingActionsStr ) : [];

			const actionData = {
				action,
				timestamp: currentTime,
				time_spent: timeSpent,
			};

			existingActions.push( actionData );
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.S2_ACTIONS, JSON.stringify( existingActions ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to track S2 action:', error );
		}
	}

	static sendS2EndState() {
		try {
			const actionsStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.S2_ACTIONS );
			const startTimeStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.START_TIME );

			if ( ! actionsStr || ! startTimeStr ) {
				return;
			}

			const actions = JSON.parse( actionsStr );
			const startTime = parseInt( startTimeStr, 10 );
			const currentTime = Date.now();
			const totalTimeSpent = Math.round( ( currentTime - startTime ) / 1000 );

			this.dispatchEvent( ONBOARDING_EVENTS_MAP.S2_END_STATE, {
				location: 'plugin_onboarding',
				trigger: 'user_redirects_out_of_step',
				step_number: 2,
				step_name: 'hello_biz_theme',
				s2_end_state: actions,
				total_time_spent: totalTimeSpent,
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.S2_ACTIONS );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send S2 end state:', error );
		}
	}

	static storeExitEventForLater( exitType, currentStep ) {
		try {
			const exitData = {
				exitType,
				currentStep,
				timestamp: Date.now(),
			};
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT, JSON.stringify( exitData ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store exit event:', error );
		}
	}

	static sendStoredExitEvent() {
		try {
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT );
			if ( ! storedDataStr ) {
				return;
			}

			const exitData = JSON.parse( storedDataStr );
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.EXIT, {
				location: 'plugin_onboarding',
				trigger: 'exit_action_detected',
				step_number: exitData.currentStep,
				step_name: this.getStepName( exitData.currentStep ),
				action_step: exitData.exitType,
				exit_timestamp: exitData.timestamp,
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_EXIT );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored exit event:', error );
		}
	}

	static getStepName( stepNumber ) {
		const stepNames = {
			1: 'account_setup',
			2: 'hello_biz_theme',
			3: 'choose_features',
			4: 'site_name',
			5: 'site_logo',
			6: 'good_to_go',
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
			this.dispatchEvent( ONBOARDING_EVENTS_MAP.SKIP, {
				location: 'plugin_onboarding',
				trigger: 'skip_clicked',
				step_number: skipData.currentStep,
				step_name: this.getStepName( skipData.currentStep ),
				action_step: skipData.currentStep,
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
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_MY_ACCOUNT, {
				location: 'plugin_onboarding',
				trigger: 'upgrade_interaction',
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
				action_step: currentStep,
				upgrade_clicked: upgradeClicked,
			} );
		}
		this.storeTopUpgradeEventForLater( currentStep, upgradeClicked );
	}

	static sendCreateMyAccount( currentStep, upgradeClicked, createAccountClicked ) {
		if ( elementorCommon.config.editor_events?.can_send_events ) {
			return this.dispatchEvent( ONBOARDING_EVENTS_MAP.CREATE_MY_ACCOUNT, {
				location: 'plugin_onboarding',
				trigger: 'upgrade_interaction',
				step_number: currentStep,
				step_name: this.getStepName( currentStep ),
				action_step: currentStep,
				upgrade_clicked: upgradeClicked,
				create_account_clicked: createAccountClicked,
			} );
		}
		this.storeCreateMyAccountEventForLater( currentStep, upgradeClicked, createAccountClicked );
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

	static storeTopUpgradeEventForLater( currentStep, upgradeClicked ) {
		try {
			const eventData = {
				currentStep,
				upgradeClicked,
				timestamp: Date.now(),
			};
			localStorage.setItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE, JSON.stringify( eventData ) );
		} catch ( error ) {
			this.handleStorageError( 'Failed to store top upgrade event:', error );
		}
	}

	static sendStoredTopUpgradeEvent() {
		try {
			const storedDataStr = localStorage.getItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
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
				upgrade_clicked: eventData.upgradeClicked,
				event_timestamp: eventData.timestamp,
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_TOP_UPGRADE );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored top upgrade event:', error );
		}
	}

	static storeCreateMyAccountEventForLater( currentStep, upgradeClicked, createAccountClicked ) {
		try {
			const eventData = {
				currentStep,
				upgradeClicked,
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
				upgrade_clicked: eventData.upgradeClicked,
				create_account_clicked: eventData.createAccountClicked,
				event_timestamp: eventData.timestamp,
			} );

			localStorage.removeItem( ONBOARDING_STORAGE_KEYS.PENDING_CREATE_MY_ACCOUNT );
		} catch ( error ) {
			this.handleStorageError( 'Failed to send stored create my account event:', error );
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

	static handleStorageError( message, error ) {
		// eslint-disable-next-line no-console
		console.warn( message, error );
	}
}
