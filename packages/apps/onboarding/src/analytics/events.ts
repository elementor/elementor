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

export interface ConnectSuccessData {
	tracking_opted_in?: boolean;
	user_id?: string | number | null;
	access_level?: number;
	kits_access_level?: number;
	access_tier?: string;
	plan_type?: string;
}
