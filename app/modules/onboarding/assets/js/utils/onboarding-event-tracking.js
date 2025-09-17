import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';

const ONBOARDING_EVENTS_MAP = {
	UPGRADE_NOW_S3: 'core_onboarding_s3_upgrade_now',
	HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz',
	CORE_ONBOARDING: 'core_onboarding',
	CONNECT_STATUS: 'core_onboarding_connect_status',
	S1_END_STATE: 'core_onboarding_s1_end_state',
};

const ONBOARDING_STORAGE_KEYS = {
	START_TIME: 'elementor_onboarding_start_time',
	INITIATED: 'elementor_onboarding_initiated',
	S1_ACTIONS: 'elementor_onboarding_s1_actions',
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

	static handleStorageError( message, error ) {
		// eslint-disable-next-line no-console
		console.warn( message, error );
	}
}
