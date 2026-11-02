export const ONBOARDING_EVENTS = {
	INITIALIZED: 'core_onboarding_initialized',
	RESUME: 'core_onboarding_resume',
	STEP_VIEWED: 'core_onboarding_step_viewed',
	LOGIN_TYPE: 'core_onboarding_login_type',
	CONNECT: 'core_onboarding_connect',
	THEME_SELECTED: 'core_onboarding_theme_selected',
	THEME_UNSELECTED: 'core_onboarding_theme_unselected',
	PRO_FEATURES_SELECTED: 'core_onboarding_pro_features_selected',
	BACK_CLICKED: 'core_onboarding_back_clicked',
	SKIP_CLICKED: 'core_onboarding_skip_clicked',
	UPGRADE_CLICKED: 'core_onboarding_upgrade_clicked',
	EXIT_CLICKED: 'core_onboarding_exit_clicked',
	SITE_STARTER_SELECTED: 'core_onboarding_site_starter_selected',
	STEP_COMPLETED: 'core_onboarding_step_completed',
	SUMMARY: 'core_onboarding_summary',
	ERROR_REPORTED: 'core_onboarding_error_reported',
	EDITOR_LOADED: 'core_onboarding_editor_loaded',
	POST_CLICK: 'core_onboarding_post_click',
	SESSION_REPLAY_START: 'core_onboarding_session_replay_start',
};

export const STEP_TARGET_NAMES = {
	1: 'connect',
	2: 'hello_theme',
	3: 'pro_features',
	4: 'site_starter',
};

export function stepLocationL1( stepNumber ) {
	return String( stepNumber );
}

export function createCoreOnboardingPayload( partial ) {
	return {
		window_name: 'core_onboarding',
		...partial,
	};
}

export function createEditorPayload( partial ) {
	return {
		window_name: 'editor',
		...partial,
	};
}
