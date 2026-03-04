import { useCallback } from 'react';
import { getMixpanel } from '@elementor/events';

import {
	OnboardingEventName,
	STEP_NUMBERS,
	enqueueEvent,
	getEventQueue,
	clearEventQueue,
	canSendEvents,
} from '../analytics';
import type { OnboardingEventPayload } from '../analytics';

function dispatchDirectly( eventName: string, payload: Record< string, unknown > ): void {
	const { dispatchEvent } = getMixpanel();
	dispatchEvent?.( eventName, payload );
}

let globalTrackingActive = false;

export function useOnboardingEvent() {
	const trackEvent = useCallback(
		( eventName: string, payload: Partial< OnboardingEventPayload > ) => {
			const fullPayload: Record< string, unknown > = {
				app_type: 'editor',
				window_name: 'core_onboarding',
				...payload,
			};

			if ( globalTrackingActive && canSendEvents() ) {
				dispatchDirectly( eventName, fullPayload );
			} else {
				enqueueEvent( eventName, fullPayload );
			}
		},
		[],
	);

	const activateTracking = useCallback( () => {
		globalTrackingActive = true;
	}, [] );

	const flushQueue = useCallback( () => {
		const queued = getEventQueue();

		queued
			.sort( ( a, b ) => a.timestamp - b.timestamp )
			.forEach( ( event ) => {
				if ( event.name && event.payload ) {
					dispatchDirectly( event.name, event.payload );
				}
			} );

		clearEventQueue();
	}, [] );

	// --- Named event functions ---

	const trackOnboardingInitialized = useCallback( () => {
		clearEventQueue();
		trackEvent( OnboardingEventName.INITIALIZED, {
			interaction_type: 'load',
			target_type: 'loaded',
			target_name: 'onboarding_first_load',
			interaction_result: 'onboarding_loaded',
			target_location: 'onboarding',
			interaction_description: 'first step of the onboarding funnel',
		} );
	}, [ trackEvent ] );

	const trackLoginType = useCallback(
		( loginType: 'social_login' | 'elementor_login' | 'guest' ) => {
			trackEvent( OnboardingEventName.LOGIN_TYPE, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'login',
				interaction_result:
					loginType === 'guest'
						? 'skip_and_onboarding_initialization'
						: 'login_option selected',
				target_value: loginType,
				target_location: 'onboarding',
				location_l1: 'login_step',
				interaction_description: 'user connect process loaded from onboarding',
			} );
		},
		[ trackEvent ],
	);

	const trackConnect = useCallback(
		( success: boolean, error?: string ) => {
			trackEvent( OnboardingEventName.CONNECT, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'connect',
				interaction_result: 'user_connect',
				target_value: success,
				target_location: 'onboarding',
				location_l1: 'connect_flow',
				interaction_description: 'user connect process loaded from onboarding',
				metadata: ! success && error ? { error } : undefined,
			} );
		},
		[ trackEvent ],
	);

	const trackProInstall = useCallback(
		( action: 'install' | 'later' ) => {
			trackEvent( OnboardingEventName.PRO_INSTALL, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: action === 'install' ? 'install_pro_on_this_site' : "i'll_do_it_later",
				interaction_result:
					action === 'install'
						? 'pro_installed_onboarding_initialization'
						: 'skip_and_onboarding_initialization',
				target_location: 'onboarding',
				location_l1: 'install_pro_step',
				state: action === 'install',
			} );
		},
		[ trackEvent ],
	);

	const trackStepViewed = useCallback(
		( viewedStepId: string ) => {
			trackEvent( OnboardingEventName.STEP_VIEWED, {
				interaction_type: 'step_load',
				target_type: 'loaded',
				target_name: viewedStepId,
				interaction_result: 'step_load',
				target_value: STEP_NUMBERS[ viewedStepId ],
				target_location: 'onboarding',
				location_l1: STEP_NUMBERS[ viewedStepId ],
				interaction_description: 'onboarding step loaded',
			} );
		},
		[ trackEvent ],
	);

	const trackPersonaSelected = useCallback(
		( value: string ) => {
			trackEvent( OnboardingEventName.PERSONA_SELECTED, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'who_are_you_building for',
				interaction_result: 'selected_and_next',
				target_value: value,
				target_location: 'onboarding',
				location_l1: 'select_persona',
				location_l2: STEP_NUMBERS.building_for,
				interaction_description: 'user chooses persona type and automatically being redirected to next step',
			} );
		},
		[ trackEvent ],
	);

	const trackSiteTopicSelected = useCallback(
		( topics: string[] ) => {
			trackEvent( OnboardingEventName.SITE_TOPIC_SELECTED, {
				interaction_type: 'click',
				target_type: 'cards',
				target_name: 'what_is_your_site_about',
				interaction_result: 'selected',
				target_value: topics,
				target_location: 'onboarding',
				location_l1: 'site_topic',
				location_l2: STEP_NUMBERS.site_about,
				interaction_description: 'user multiselects site topics',
			} );
		},
		[ trackEvent ],
	);

	const trackExperienceSelected = useCallback(
		( level: string ) => {
			trackEvent( OnboardingEventName.EXPERIENCE_SELECTED, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'how_experienced_are_you?',
				interaction_result: 'selected_and_next',
				target_value: level,
				target_location: 'onboarding',
				location_l1: 'select_experience',
				location_l2: STEP_NUMBERS.experience_level,
				interaction_description: 'user chooses experience_level and automatically being redirected to next step',
			} );
		},
		[ trackEvent ],
	);

	const trackThemeSuggested = useCallback(
		( theme: string ) => {
			trackEvent( OnboardingEventName.THEME_SUGGESTED, {
				interaction_type: 'exposure',
				target_type: 'chip',
				target_name: 'recommended',
				interaction_result: 'theme_recommended',
				target_value: theme,
				target_location: 'onboarding',
				location_l1: 'select_theme',
				location_l2: STEP_NUMBERS.theme_selection,
				interaction_description: 'user got a recommendation for a certain theme',
			} );
		},
		[ trackEvent ],
	);

	const trackThemeSelected = useCallback(
		( theme: string ) => {
			trackEvent( OnboardingEventName.THEME_SELECTED, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'continue_with_this_theme',
				interaction_result: 'theme_installed',
				target_value: theme,
				target_location: 'onboarding',
				location_l1: 'select_theme',
				location_l2: STEP_NUMBERS.theme_selection,
				interaction_description: 'user installed a certain theme',
			} );
		},
		[ trackEvent ],
	);

	const trackProFeaturesSelected = useCallback(
		( params: { targetName: 'continue_with_free' | 'compare plans'; features: string[] } ) => {
			trackEvent( OnboardingEventName.PRO_FEATURES_SELECTED, {
				interaction_type: 'click',
				target_type: 'cards',
				target_name: params.targetName,
				interaction_result: params.targetName === 'continue_with_free' ? 'finish_onboarding' : 'pricing_page',
				target_value: params.features,
				target_location: 'onboarding',
				location_l1: 'pro_features',
				location_l2: STEP_NUMBERS.site_features,
				interaction_description: 'user selected pro features and continued',
			} );
		},
		[ trackEvent ],
	);

	const trackBackClicked = useCallback(
		( currentStepId: string ) => {
			trackEvent( OnboardingEventName.BACK_CLICKED, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'back',
				interaction_result: 'redirect_back',
				target_value: STEP_NUMBERS[ currentStepId ],
				target_location: 'onboarding_navigation',
				location_l1: 'footer',
				location_l2: STEP_NUMBERS[ currentStepId ],
			} );
		},
		[ trackEvent ],
	);

	const trackSkipClicked = useCallback(
		( currentStepId: string ) => {
			trackEvent( OnboardingEventName.SKIP_CLICKED, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'skip',
				interaction_result: 'skip_step',
				target_value: STEP_NUMBERS[ currentStepId ],
				target_location: 'onboarding_navigation',
				location_l1: 'footer',
				location_l2: STEP_NUMBERS[ currentStepId ],
			} );
		},
		[ trackEvent ],
	);

	const trackUpgradeClicked = useCallback(
		( currentStepId: string ) => {
			trackEvent( OnboardingEventName.UPGRADE_CLICKED, {
				interaction_type: 'click',
				target_type: 'button',
				target_name: 'upgrade',
				interaction_result: 'pricing_page_opened',
				target_value: STEP_NUMBERS[ currentStepId ],
				target_location: 'onboarding_navigation',
				location_l1: 'header',
				location_l2: STEP_NUMBERS[ currentStepId ],
			} );
		},
		[ trackEvent ],
	);

	const trackResumeOnboarding = useCallback(
		( resumeStepId: string ) => {
			trackEvent( OnboardingEventName.RESUME_ONBOARDING, {
				interaction_type: 'onboarding_load',
				target_type: 'reloaded',
				target_name: 'reloaded',
				interaction_result: 'onboarding_load',
				target_value: STEP_NUMBERS[ resumeStepId ],
				target_location: 'onboarding',
				location_l1: STEP_NUMBERS[ resumeStepId ],
				interaction_description: 'onboarding step loaded',
			} );
		},
		[ trackEvent ],
	);

	return {
		trackOnboardingInitialized,
		trackLoginType,
		trackConnect,
		trackProInstall,
		trackStepViewed,
		trackPersonaSelected,
		trackSiteTopicSelected,
		trackExperienceSelected,
		trackThemeSuggested,
		trackThemeSelected,
		trackProFeaturesSelected,
		trackBackClicked,
		trackSkipClicked,
		trackUpgradeClicked,
		trackResumeOnboarding,
		activateTracking,
		flushQueue,
	};
}
