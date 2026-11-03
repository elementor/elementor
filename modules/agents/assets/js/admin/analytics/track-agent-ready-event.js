import {
	APP_TYPE_WP_ADMIN,
	EVENT_ACTIVATION_CLICKED,
	EVENT_BOT_PERMISSION_CHANGED,
	EVENT_FEATURE_TOGGLED,
	EVENT_POST_TYPE_TOGGLED,
	EVENT_WELCOME_VIEWED,
	LOCATION_L1,
	WINDOW_ONBOARDING,
	WINDOW_SETTINGS,
} from './agent-ready-events';

const dispatch = ( eventName, payload ) => window.elementorCommon?.eventsManager?.dispatchEvent?.( eventName, {
	app_type: APP_TYPE_WP_ADMIN,
	location_l1: LOCATION_L1,
	...payload,
} );

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

export const trackPostTypeToggled = ( { featureName, postType, isIncluded } ) => dispatch( EVENT_POST_TYPE_TOGGLED, {
	window_name: WINDOW_SETTINGS,
	interaction_type: 'click',
	target_type: 'toggle',
	target_name: 'post_type_toggle',
	feature_name: featureName,
	post_type: postType,
	interaction_result: isIncluded ? 'included' : 'excluded',
	target_location: 'main',
	location_l2: featureName,
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
