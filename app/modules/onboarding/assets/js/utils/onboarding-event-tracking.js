import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';

const ONBOARDING_EVENTS_MAP = {
	UPGRADE_NOW_S3: 'core_onboarding_s3_upgrade_now',
	HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz',
	CORE_ONBOARDING: 'core_onboarding',
	CONNECT_STATUS: 'core_onboarding_connect_status',
};

const ONBOARDING_STORAGE_KEYS = {
	START_TIME: 'elementor_onboarding_start_time',
	INITIATED: 'elementor_onboarding_initiated',
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
			// eslint-disable-next-line no-console
			console.warn( 'Failed to store onboarding initiation data:', error );
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
			// eslint-disable-next-line no-console
			console.warn( 'Failed to clear onboarding storage:', error );
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
}
