import {
	APP_TYPE_WP_ADMIN,
	EVENT_ACTIVATION_CLICKED,
	EVENT_BOT_PERMISSION_CHANGED,
	EVENT_CUSTOM_CRAWLER_ADDED,
	EVENT_DASHBOARD_CTA_CLICKED,
	EVENT_FEATURE_CONFLICT_DETECTED,
	EVENT_FEATURE_TOGGLED,
	EVENT_FILE_OPENED,
	EVENT_POST_TYPE_TOGGLED,
	EVENT_WELCOME_VIEWED,
	LOCATION_L1,
	POST_TYPE_ANALYTICS_NAMES,
	TARGET_TYPE_BUTTON,
	TRANSPORT_SEND_BEACON,
	WINDOW_DASHBOARD,
	WINDOW_ONBOARDING,
	WINDOW_SETTINGS,
} from './agent-ready-events';

const dispatch = ( eventName, payload, ...dispatchOptions ) => window.elementorCommon?.eventsManager?.dispatchEvent?.( eventName, {
	app_type: APP_TYPE_WP_ADMIN,
	location_l1: LOCATION_L1,
	site_id: window.elementorAgentsReadyConfig?.siteKey,
	...payload,
}, ...dispatchOptions );

export const trackWelcomeViewed = () => dispatch( EVENT_WELCOME_VIEWED, {
	window_name: WINDOW_ONBOARDING,
	interaction_type: 'view',
	target_type: 'screen',
	target_name: 'welcome_screen',
	interaction_result: 'viewed',
	target_location: 'main',
	location_l2: 'activation',
} );

export const trackActivationClicked = () => dispatch( EVENT_ACTIVATION_CLICKED, {
	window_name: WINDOW_ONBOARDING,
	interaction_type: 'click',
	target_type: 'button',
	target_name: 'activate_button',
	interaction_result: 'all_defaults_activated',
	target_location: 'main',
	location_l2: 'activation',
} );

export const trackFeatureToggled = ( { featureName, isEnabled, hasConflict } ) => dispatch( EVENT_FEATURE_TOGGLED, {
	window_name: WINDOW_SETTINGS,
	interaction_type: 'click',
	target_type: 'toggle',
	target_name: 'feature_toggle',
	feature_name: featureName,
	interaction_result: isEnabled ? 'feature_enabled' : 'feature_disabled',
	target_location: 'overview',
	location_l2: 'overview',
	has_conflict: !! hasConflict,
} );

export const trackFeatureConflictDetected = ( { featureName } ) => dispatch( EVENT_FEATURE_CONFLICT_DETECTED, {
	window_name: WINDOW_SETTINGS,
	interaction_type: 'view',
	target_type: 'toggle',
	target_name: 'file_conflict',
	feature_name: featureName,
	interaction_result: 'conflict_detected',
	target_location: 'overview',
	location_l2: 'overview',
	has_conflict: true,
} );

export const trackPostTypeToggled = ( { featureName, postType, isIncluded } ) => dispatch( EVENT_POST_TYPE_TOGGLED, {
	window_name: WINDOW_SETTINGS,
	interaction_type: 'click',
	target_type: 'toggle',
	target_name: 'post_type_toggle',
	feature_name: featureName,
	post_type: POST_TYPE_ANALYTICS_NAMES[ postType ] ?? postType,
	interaction_result: isIncluded ? 'included' : 'excluded',
	target_location: 'main',
	location_l2: featureName,
} );

export const trackFileOpened = ( { fileType } ) => dispatch( EVENT_FILE_OPENED, {
	window_name: WINDOW_SETTINGS,
	interaction_type: 'click',
	target_type: TARGET_TYPE_BUTTON,
	target_name: 'edit_file_button',
	file_type: fileType,
	interaction_result: 'opened_for_edit',
	target_location: 'main',
	location_l2: fileType,
} );

export const trackBotPermissionChanged = ( { scope, crawlerId, permissionType, isAllowed, targetType } ) => dispatch( EVENT_BOT_PERMISSION_CHANGED, {
	window_name: WINDOW_SETTINGS,
	interaction_type: 'click',
	target_type: targetType,
	target_name: 'bot_permission_control',
	scope,
	crawler_id: crawlerId,
	...( permissionType && { permission_type: permissionType } ),
	interaction_result: isAllowed ? 'allowed' : 'blocked',
	target_location: 'bot_access_table',
	location_l2: 'bot_access',
} );

export const trackCustomCrawlerAdded = ( { crawlerToken } ) => dispatch( EVENT_CUSTOM_CRAWLER_ADDED, {
	window_name: WINDOW_SETTINGS,
	interaction_type: 'click',
	target_type: TARGET_TYPE_BUTTON,
	target_name: 'add_custom_crawler_button',
	crawler_token: crawlerToken,
	interaction_result: 'success',
	target_location: 'bot_access_table',
	location_l2: 'bot_access',
} );

export const trackDashboardCtaClicked = ( state ) => dispatch( EVENT_DASHBOARD_CTA_CLICKED, {
	window_name: WINDOW_DASHBOARD,
	interaction_type: 'click',
	target_type: TARGET_TYPE_BUTTON,
	target_name: 'dashboard_cta',
	interaction_result: state,
	target_location: 'overview_widget',
	location_l2: 'dashboard',
}, { transport: TRANSPORT_SEND_BEACON } );
