import eventsConfig from '../../../../../../core/common/modules/events-manager/assets/js/events-config';

const ONBOARDING_EVENTS_MAP = {
	VIEW_ACCOUNT_SETUP: 'view_account_setup',
	SKIP_SETUP: 'skip_setup',
	NEW_ACCOUNT_CONNECT: 'new_account_connect',
	EXISTING_ACCOUNT_CONNECT: 'existing_account_connect',
	ACCOUNT_CONNECTED_SUCCESS: 'account_connected_success',
	HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz',
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

	static sendHelloBizContinue( stepNumber = 2 ) {
		return this.dispatchEvent( ONBOARDING_EVENTS_MAP.HELLO_BIZ_CONTINUE, {
			location: 'plugin_onboarding',
			trigger: eventsConfig.triggers.click,
			step_number: stepNumber,
			step_name: 'hello_biz_theme',
		} );
	}

	static dispatchElementorEvent( event, details = {} ) {
		return elementorCommon.events.dispatchEvent( {
			event,
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				...details,
			},
		} );
	}

	static sendNextEvent( currentStep ) {
		return this.dispatchElementorEvent( 'next', {
			step: currentStep,
		} );
	}

	static sendAccountConnectIndicationPrompt( actionState, currentStep ) {
		return this.dispatchElementorEvent( 'indication prompt', {
			step: currentStep,
			action_state: actionState,
			action: 'connect account',
		} );
	}

	static sendIndicationPrompt( action, actionState, currentStep, extraDetails = {} ) {
		return this.dispatchElementorEvent( 'indication prompt', {
			step: currentStep,
			action_state: actionState,
			action,
			...extraDetails,
		} );
	}

	static sendPageViewEvent( currentStep ) {
		return this.dispatchElementorEvent( 'page view', {
			step: currentStep,
		} );
	}

	static sendSkipEvent( currentStep ) {
		return this.dispatchElementorEvent( 'skip', {
			step: currentStep,
		} );
	}

	static sendBackEvent( currentStep ) {
		return this.dispatchElementorEvent( 'back', {
			step: currentStep,
		} );
	}

	static sendCloseEvent( currentStep ) {
		return this.dispatchElementorEvent( 'close', {
			step: currentStep,
		} );
	}

	static sendPopoverEvent( eventType, currentStep, popoverType = null ) {
		const details = { step: currentStep };
		if ( popoverType ) {
			details.popover_type = popoverType;
		}
		return this.dispatchElementorEvent( eventType, details );
	}
}
