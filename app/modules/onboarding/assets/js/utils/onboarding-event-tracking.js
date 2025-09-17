import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';

const ONBOARDING_EVENTS_MAP = {
	UPGRADE_NOW_S3: 'core_onboarding_s3_upgrade_now',
	HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz',
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
}
