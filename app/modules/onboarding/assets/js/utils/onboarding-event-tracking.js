import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';

const ONBOARDING_EVENTS_MAP = {
	VIEW_ACCOUNT_SETUP: 'view_account_setup',
	SKIP_SETUP: 'skip_setup',
	NEW_ACCOUNT_CONNECT: 'new_account_connect',
	EXISTING_ACCOUNT_CONNECT: 'existing_account_connect',
	ACCOUNT_CONNECTED_SUCCESS: 'account_connected_success',
};

export class OnboardingEventTracking {
	static dispatchEvent( eventName, payload ) {
		if ( ! elementorCommon.config.editor_events?.can_send_events ) {
			return;
		}

		return elementorCommon.eventsManager.dispatchEvent( eventName, payload );
	}

	static sendViewAccountSetup( isLibraryConnected ) {
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.VIEW_ACCOUNT_SETUP, {
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.pageLoaded,
			step_number: 1,
			step_name: 'account_setup',
			is_library_connected: isLibraryConnected || false,
		} );
	}

	static sendSkipSetup() {
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.SKIP_SETUP, {
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.click,
			step_number: 1,
			step_name: 'account_setup',
		} );
	}

	static sendNewAccountConnect( buttonText = 'Start setup' ) {
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.NEW_ACCOUNT_CONNECT, {
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.click,
			step_number: 1,
			step_name: 'account_setup',
			button_text: buttonText,
		} );
	}

	static sendExistingAccountConnect( buttonText = 'Click here to connect' ) {
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.EXISTING_ACCOUNT_CONNECT, {
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.click,
			step_number: 1,
			step_name: 'account_setup',
			button_text: buttonText,
		} );
	}

	static sendAccountConnectedSuccess( data ) {
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.ACCOUNT_CONNECTED_SUCCESS, {
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.success,
			step_number: 1,
			step_name: 'account_setup',
			connection_successful: true,
			user_tier: data.access_tier,
		} );
	}
}
