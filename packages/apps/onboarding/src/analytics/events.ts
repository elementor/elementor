export const OnboardingEventName = {
	INITIALIZED: 'ob_onboarding_initialized',
	LOGIN_TYPE: 'ob_login_type',
	CONNECT: 'ob_connect',
	PRO_INSTALL: 'ob_pro_install',
	STEP_VIEWED: 'ob_step_viewed',
	PERSONA_SELECTED: 'ob_persona_selected',
	SITE_TOPIC_SELECTED: 'ob_site_topic_selected',
	EXPERIENCE_SELECTED: 'ob_experience_selected',
	THEME_SUGGESTED: 'ob_theme_suggested',
	THEME_SELECTED: 'ob_theme_selected',
	PRO_FEATURES_SELECTED: 'ob_pro_features_selected',
	BACK_CLICKED: 'ob_back_clicked',
	SKIP_CLICKED: 'ob_skip_clicked',
	UPGRADE_CLICKED: 'ob_upgrade_clicked',
	RESUME_ONBOARDING: 'ob_resume_onboarding',
	SITE_STARTER_SELECTED: 'ob_site_starter_selected',
	SUMMARY: 'ob_summary',
	ERROR_REPORTED: 'ob_error_reported',
} as const;

export const STEP_NUMBERS: Record< string, string > = {
	login: '0',
	pro_install: '0',
	building_for: '1',
	site_about: '2',
	experience_level: '3',
	theme_selection: '4',
	site_features: '5',
};

/** REFINED: do not send pre-selected core features in pro_features. Must match site-features.tsx core options. */
export const PRO_FEATURES_CORE_IDS = new Set( [ 'classes_variables', 'core_placeholder' ] );

/** REFINED: target_name for ob_persona_selected. */
export const TARGET_NAME_PERSONA = 'who_are_you_building_for';

/** REFINED: map UI persona values to analytics target_value. */
export const PERSONA_VALUE_MAP: Record< string, string > = {
	myself: 'myself_or_someone_i_know',
	business: 'my_business_or_workplace',
	client: 'a_client',
	exploring: 'just_exploring',
};

/** REFINED: map UI experience values to analytics target_value (advanced -> expert). */
export const EXPERIENCE_VALUE_MAP: Record< string, string > = {
	beginner: 'beginner',
	intermediate: 'intermediate',
	advanced: 'expert',
};

/** REFINED: map theme slugs to analytics target_value (hello | hellobiz). */
export const THEME_VALUE_MAP: Record< string, string > = {
	'hello-elementor': 'hello',
	'hello-biz': 'hellobiz',
};

/** REFINED: step target_name for ob_step_viewed (stepId -> spec name). */
export const STEP_SPEC_NAMES: Record< string, string > = {
	login: 'login',
	pro_install: 'pro_install',
	building_for: 'who_are_you_building for',
	site_about: 'What_is_your_site_about',
	experience_level: 'how_experienced_are_you?',
	theme_selection: 'theme_install',
	site_features: 'pro_features',
};

export interface OnboardingEventPayload {
	app_type: 'editor';
	window_name: 'core_onboarding' | 'editor';
	interaction_type: string;
	target_type: string;
	target_name: string;
	interaction_result: string;
	target_value?: string | string[] | boolean | number;
	target_location: string;
	location_l1: string;
	location_l2?: string;
	location_l3?: string;
	interaction_description?: string;
	metadata?: Record< string, unknown >;
	state?: unknown;
}

/** REFINED: user interacts with AI/website templates/close/widget on first canvas (editor). */
export type SiteStarterTargetName =
	| 'AI_site_planner'
	| 'Website templates'
	| 'clicked_x'
	| 'widget_dragged';

export type SiteStarterInteractionResult =
	| 'site_planner_opened'
	| 'kit_library_opened'
	| 'closed'
	| 'widget_dragged';

/** REFINED: metadata item for ob_summary (key-value). */
export interface ObSummaryMetadataItem {
	key: string;
	value: unknown;
}

/** Snapshot of onboarding state for ob_summary. */
export interface ObSummarySnapshot {
	choices: {
		building_for?: string | null;
		site_about?: string[];
		experience_level?: string | null;
		theme_selection?: string | null;
		site_features?: string[];
	};
	completedSteps: string[];
	isConnected: boolean;
	isGuest: boolean;
	proInstall?: boolean;
	/** Recommended theme slug shown to user, or "none". */
	themeRecommended?: string;
}

export interface ConnectSuccessData {
	tracking_opted_in?: boolean;
	user_id?: string | number | null;
	access_level?: number;
	kits_access_level?: number;
	access_tier?: string;
	plan_type?: string;
}

/** Enforces target_type/target_name pairing for ob_error_reported. */
export type ErrorReportedTarget =
	| { targetType: 'install'; targetName: 'install_pro_on_this_site' | 'continue_with_this_theme' }
	| { targetType: 'save'; targetName: string }
	| { targetType: 'request'; targetName: string };
