type EventConfig = {
	eventName: string;
	once: boolean;
	payload: Record< string, string >;
};

type OnboardingEventsConfig = Record< string, EventConfig >;

const onboardingEventsConfig: OnboardingEventsConfig = {
	ONBOARDING_STARTED: {
		eventName: 'ob_onboarding_started',
		once: true,
		payload: {
			app_type: 'editor',
			window_name: 'core_onboarding',
			interaction_type: 'load',
			target_type: 'loaded',
			target_name: 'onboarding_first_load',
			interaction_result: 'app_loaded',
			target_location: 'onboarding',
			interaction_description:
				'first step of the onboarding funnel after login. our first possible reference point for ob.',
		},
	},
};

export default onboardingEventsConfig;
