export const BASE_PAYLOAD = {
	app_type: 'editor',
	window_name: 'core_onboarding',
};

type EventPayload = {
	interaction_type?: string;
	interaction_result?: string;
	interaction_description?: string;
	target_type?: string;
	target_name?: string;
	target_value?: string;
	target_location?: string;
	location_l1?: string;
	location_l2?: string;
	location_l3?: string;
};

type EventConfig = {
	eventName: string;
	once: boolean;
	payload: EventPayload;
};

type OnboardingEventsConfig = Record< string, EventConfig >;

const onboardingEventsConfig: OnboardingEventsConfig = {
	ONBOARDING_STARTED: {
		eventName: 'ob_onboarding_started',
		once: true,
		payload: {
			interaction_type: 'load',
			target_type: 'loaded',
			target_name: 'onboarding_first_load',
			interaction_result: 'app_loaded',
			target_location: 'onboarding',
			interaction_description:
				'first step of the onboarding funnel after login. our first possible reference point for ob.',
		},
	},
	OB_CONNECTED: {
		eventName: 'ob_connected',
		once: true,
		payload: {
			interaction_type: 'connect',
			target_type: 'button',
			target_name: 'connect',
			interaction_result: 'user_connected',
			target_location: 'onboarding',
			location_l1: 'connect_flow',
			interaction_description: 'user connect process loaded from onboarding',
		},
	},
	OB_STEP_VIEWED: {
		eventName: 'ob_step_viewed',
		once: false,
		payload: {
			interaction_type: 'step_load',
			target_type: 'loaded',
			target_name: 'step_load',
			interaction_result: 'step_load',
			target_location: 'onboarding',
			interaction_description: 'onboarding step loaded',
		},
	},
};

export default onboardingEventsConfig;
