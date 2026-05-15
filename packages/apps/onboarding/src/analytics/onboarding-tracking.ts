import { canSendEvents, getMixpanel } from '@elementor/events';

import { CORE_FEATURE_IDS } from './core-feature-ids';
import { clearEventQueue, enqueueEvent, getEventQueue } from './event-queue';
import type {
	ErrorReportedTarget,
	ObSummaryMetadataItem,
	ObSummarySnapshot,
	OnboardingEventPayload,
	SiteStarterInteractionResult,
	SiteStarterTargetName,
} from './events';
import {
	EXPERIENCE_VALUE_MAP,
	OnboardingEventName,
	PERSONA_VALUE_MAP,
	STEP_NUMBERS,
	STEP_SPEC_NAMES,
	TARGET_NAME_PERSONA,
	THEME_VALUE_MAP,
} from './events';

function dispatchDirectly( eventName: string, payload: Record< string, unknown > ): void {
	const { dispatchEvent } = getMixpanel();
	dispatchEvent?.( eventName, payload );
}

function trackEvent( isActive: boolean, eventName: string, payload: Partial< OnboardingEventPayload > ): void {
	const fullPayload: Record< string, unknown > = {
		app_type: 'editor',
		window_name: 'core_onboarding',
		...payload,
	};

	if ( isActive && canSendEvents() ) {
		dispatchDirectly( eventName, fullPayload );
	} else {
		enqueueEvent( eventName, fullPayload );
	}
}

export function flushQueue(): void {
	const queued = getEventQueue();

	queued
		.sort( ( a: { timestamp: number }, b: { timestamp: number } ) => a.timestamp - b.timestamp )
		.forEach( ( event: { name: string; payload: Record< string, unknown > } ) => {
			if ( event.name && event.payload ) {
				dispatchDirectly( event.name, event.payload );
			}
		} );

	clearEventQueue();
}

export function trackOnboardingInitialized( isActive: boolean ): void {
	clearEventQueue();
	trackEvent( isActive, OnboardingEventName.INITIALIZED, {
		interaction_type: 'load',
		target_type: 'loaded',
		target_name: 'onboarding_first_load',
		interaction_result: 'onboarding_loaded',
		target_location: 'onboarding',
		interaction_description: 'first step of the onboarding funnel',
	} );
}

export function trackLoginType( isActive: boolean, loginType: 'social_login' | 'elementor_login' | 'guest' ): void {
	trackEvent( isActive, OnboardingEventName.LOGIN_TYPE, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'login',
		interaction_result: loginType === 'guest' ? 'skip_and_onboarding_initialization' : 'login_option selected',
		target_value: loginType,
		target_location: 'onboarding',
		location_l1: 'login_step',
		interaction_description: 'user connect process loaded from onboarding',
	} );
}

export function trackConnect( isActive: boolean, success: boolean, error?: string ): void {
	trackEvent( isActive, OnboardingEventName.CONNECT, {
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
}

export function trackProInstall( isActive: boolean, action: 'install' | 'later' ): void {
	trackEvent( isActive, OnboardingEventName.PRO_INSTALL, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: action === 'install' ? 'install_pro_on_this_site' : "i'll_do_it_later",
		interaction_result:
			action === 'install' ? 'pro_installed_onboarding_initialization' : 'skip_and_onboarding_initialization',
		target_location: 'onboarding',
		location_l1: 'install_pro_step',
		state: action === 'install',
	} );
}

export function trackStepViewed( isActive: boolean, viewedStepId: string ): void {
	trackEvent( isActive, OnboardingEventName.STEP_VIEWED, {
		interaction_type: 'step_load',
		target_type: 'loaded',
		target_name: STEP_SPEC_NAMES[ viewedStepId ] ?? viewedStepId,
		interaction_result: 'step_load',
		target_value: STEP_NUMBERS[ viewedStepId ],
		target_location: 'onboarding',
		location_l1: STEP_NUMBERS[ viewedStepId ],
		interaction_description: 'onboarding step loaded',
	} );
}

export function trackPersonaSelected( isActive: boolean, value: string ): void {
	trackEvent( isActive, OnboardingEventName.PERSONA_SELECTED, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: TARGET_NAME_PERSONA,
		interaction_result: 'selected_and_next',
		target_value: PERSONA_VALUE_MAP[ value ] ?? value,
		target_location: 'onboarding',
		location_l1: 'select_persona',
		location_l2: STEP_NUMBERS.building_for,
		interaction_description: 'user chooses persona type and automatically being redirected to next step',
	} );
}

export function trackSiteTopicSelected( isActive: boolean, topics: string[] ): void {
	trackEvent( isActive, OnboardingEventName.SITE_TOPIC_SELECTED, {
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
}

export function trackExperienceSelected( isActive: boolean, level: string ): void {
	trackEvent( isActive, OnboardingEventName.EXPERIENCE_SELECTED, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'how_experienced_are_you',
		interaction_result: 'selected_and_next',
		target_value: EXPERIENCE_VALUE_MAP[ level ] ?? level,
		target_location: 'onboarding',
		location_l1: 'select_experience',
		location_l2: STEP_NUMBERS.experience_level,
		interaction_description: 'user chooses experience_level and automatically being redirected to next step',
	} );
}

export function trackThemeSuggested( isActive: boolean, theme: string ): void {
	trackEvent( isActive, OnboardingEventName.THEME_SUGGESTED, {
		interaction_type: 'exposure',
		target_type: 'chip',
		target_name: 'recommended',
		interaction_result: 'theme_recommended',
		target_value: THEME_VALUE_MAP[ theme ] ?? theme,
		target_location: 'onboarding',
		location_l1: 'select_theme',
		location_l2: STEP_NUMBERS.theme_selection,
		interaction_description: 'user got a recommendation for a certain theme',
	} );
}

export function trackThemeSelected( isActive: boolean, theme: string ): void {
	trackEvent( isActive, OnboardingEventName.THEME_SELECTED, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'continue_with_this_theme',
		interaction_result: 'theme_installed',
		target_value: THEME_VALUE_MAP[ theme ] ?? theme,
		target_location: 'onboarding',
		location_l1: 'select_theme',
		location_l2: STEP_NUMBERS.theme_selection,
		interaction_description: 'user installed a certain theme',
	} );
}

export function trackProFeaturesSelected(
	isActive: boolean,
	params: {
		targetName: 'continue_with_free' | 'compare plans';
		features: string[];
	}
): void {
	const featuresWithoutCore = params.features.filter( ( id ) => ! CORE_FEATURE_IDS.has( id ) );
	trackEvent( isActive, OnboardingEventName.PRO_FEATURES_SELECTED, {
		interaction_type: 'click',
		target_type: 'cards',
		target_name: params.targetName,
		interaction_result: params.targetName === 'continue_with_free' ? 'finish_onboarding' : 'pricing_page',
		target_value: featuresWithoutCore,
		target_location: 'onboarding',
		location_l1: 'pro_features',
		location_l2: STEP_NUMBERS.site_features,
		interaction_description: 'user selected pro features and continued',
	} );
}

export function trackBackClicked( isActive: boolean, currentStepId: string ): void {
	trackEvent( isActive, OnboardingEventName.BACK_CLICKED, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'back',
		interaction_result: 'redirect_back',
		target_value: STEP_NUMBERS[ currentStepId ],
		target_location: 'onboarding_navigation',
		location_l1: 'footer',
		location_l2: STEP_NUMBERS[ currentStepId ],
	} );
}

export function trackSkipClicked( isActive: boolean, currentStepId: string ): void {
	trackEvent( isActive, OnboardingEventName.SKIP_CLICKED, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'skip',
		interaction_result: 'skip_step',
		target_value: STEP_NUMBERS[ currentStepId ],
		target_location: 'onboarding_navigation',
		location_l1: 'footer',
		location_l2: STEP_NUMBERS[ currentStepId ],
	} );
}

export function trackUpgradeClicked( isActive: boolean, currentStepId: string ): void {
	trackEvent( isActive, OnboardingEventName.UPGRADE_CLICKED, {
		interaction_type: 'click',
		target_type: 'button',
		target_name: 'upgrade',
		interaction_result: 'pricing_page_opened',
		target_value: STEP_NUMBERS[ currentStepId ],
		target_location: 'onboarding_navigation',
		location_l1: 'header',
		location_l2: STEP_NUMBERS[ currentStepId ],
	} );
}

export function trackResumeOnboarding( isActive: boolean, resumeStepId: string ): void {
	trackEvent( isActive, OnboardingEventName.RESUME_ONBOARDING, {
		interaction_type: 'onboarding_load',
		target_type: 'reloaded',
		target_name: 'reloaded',
		interaction_result: 'onboarding_load',
		target_value: STEP_NUMBERS[ resumeStepId ],
		target_location: 'onboarding',
		location_l1: STEP_NUMBERS[ resumeStepId ],
		interaction_description: 'onboarding step loaded',
	} );
}

export function trackSiteStarterSelected(
	isActive: boolean,
	params: {
		targetName: SiteStarterTargetName;
		interactionResult: SiteStarterInteractionResult;
	}
): void {
	trackEvent( isActive, OnboardingEventName.SITE_STARTER_SELECTED, {
		window_name: 'editor',
		interaction_type: 'click',
		target_type: 'card',
		target_name: params.targetName,
		interaction_result: params.interactionResult,
		target_location: 'start_building',
		location_l1: '',
		interaction_description: 'user selected or ignored site starters on first load of canvas',
	} );
}

function toSummaryValue( v: unknown ): unknown {
	if ( v === null || v === undefined || v === '' ) {
		return 'skip';
	}
	if ( Array.isArray( v ) && v.length === 0 ) {
		return 'skip';
	}
	return v;
}

export function trackSummary( isActive: boolean, snapshot: ObSummarySnapshot ): void {
	const proFeaturesOnly = ( snapshot.choices.site_features ?? [] ).filter( ( id ) => ! CORE_FEATURE_IDS.has( id ) );

	const metadata: ObSummaryMetadataItem[] = [
		{
			key: 'login_type',
			value: toSummaryValue( snapshot.isGuest ? 'guest' : 'elementor_login' ),
		},
		{ key: 'connect', value: snapshot.isConnected },
		{
			key: 'pro_install',
			value: toSummaryValue( snapshot.proInstall ?? false ),
		},
		{
			key: 'persona',
			value: toSummaryValue(
				snapshot.choices.building_for !== null && snapshot.choices.building_for !== undefined
					? PERSONA_VALUE_MAP[ snapshot.choices.building_for ] ?? snapshot.choices.building_for
					: null
			),
		},
		{
			key: 'site_topic',
			value: toSummaryValue( snapshot.choices.site_about ?? [] ),
		},
		{
			key: 'experience_level',
			value: toSummaryValue(
				snapshot.choices.experience_level !== null && snapshot.choices.experience_level !== undefined
					? EXPERIENCE_VALUE_MAP[ snapshot.choices.experience_level ] ?? snapshot.choices.experience_level
					: null
			),
		},
		{
			key: 'theme_recommended',
			value: ( (): string => {
				const raw = snapshot.themeRecommended ?? snapshot.choices.theme_selection ?? 'none';
				return raw === 'none' || ! raw ? 'none' : THEME_VALUE_MAP[ raw ] ?? raw;
			} )(),
		},
		{
			key: 'theme_installed',
			value:
				snapshot.choices.theme_selection !== null && snapshot.choices.theme_selection !== undefined
					? THEME_VALUE_MAP[ snapshot.choices.theme_selection ] ?? snapshot.choices.theme_selection
					: 'none',
		},
		{
			key: 'pro_features',
			value: toSummaryValue( proFeaturesOnly.length ? proFeaturesOnly : 'skip' ),
		},
		{
			key: 'steps_completed',
			value: snapshot.completedSteps.length,
		},
	];

	trackEvent( isActive, OnboardingEventName.SUMMARY, {
		interaction_type: 'onboarding_complete',
		target_type: 'summary',
		target_name: 'ob_summary',
		interaction_result: 'onboarding_final_choices',
		target_location: 'onboarding',
		location_l1: 'summary',
		interaction_description: 'trigger event upon onboarding completion or when flow is closed abruptly',
		metadata: { summary: metadata },
	} );
}

export function trackErrorReported(
	isActive: boolean,
	params: ErrorReportedTarget & { stepId: string; errorBody: string }
): void {
	trackEvent( isActive, OnboardingEventName.ERROR_REPORTED, {
		interaction_type: 'action_failed',
		target_type: params.targetType,
		target_name: params.targetName,
		interaction_result: 'error_reported',
		target_value: STEP_NUMBERS[ params.stepId ] ?? params.stepId,
		target_location: 'onboarding',
		location_l1: STEP_NUMBERS[ params.stepId ] ?? params.stepId,
		interaction_description: 'onboarding step loaded',
		metadata: { error_title: params.errorBody },
	} );
}
