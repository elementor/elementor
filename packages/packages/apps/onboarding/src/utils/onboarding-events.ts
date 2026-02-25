import { canSendEvents, safeDispatch } from '@elementor/events';

import onboardingEventsConfig, { BASE_PAYLOAD } from './onboarding-events-config';

class OnboardingEventManager {
	sentEvents = new Set< string >();
	EVENT_CONFIGS = onboardingEventsConfig;

	send( eventKey: string, payloadOverrides: Record< string, unknown > = {} ): boolean {
		const config = this.EVENT_CONFIGS[ eventKey ];

		if ( ! config ) {
			return false;
		}

		if ( config.once && this.sentEvents.has( eventKey ) ) {
			return false;
		}

		if ( ! canSendEvents() ) {
			return false;
		}

		const result = safeDispatch( config.eventName, { ...BASE_PAYLOAD, ...config.payload, ...payloadOverrides } );

		if ( result !== false && config.once ) {
			this.sentEvents.add( eventKey );
		}

		return result;
	}
}

const onboardingEventManager = new OnboardingEventManager();

export { OnboardingEventManager };
export default onboardingEventManager;
