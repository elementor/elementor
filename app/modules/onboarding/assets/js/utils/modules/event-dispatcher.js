export const ONBOARDING_EVENTS_MAP = {
	UPGRADE_NOW_S3: 'core_onboarding_s3_upgrade_now',
	HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz',
	CORE_ONBOARDING: 'core_onboarding',
	CONNECT_STATUS: 'core_onboarding_connect_status',
	STEP1_END_STATE: 'core_onboarding_s1_end_state',
	STEP2_END_STATE: 'core_onboarding_s2_end_state',
	STEP3_END_STATE: 'core_onboarding_s3_end_state',
	STEP4_END_STATE: 'core_onboarding_s4_end_state',
	STEP4_RETURN_STEP4: 'core_onboarding_s4_return',
	EDITOR_LOADED_FROM_ONBOARDING: 'editor_loaded_from_onboarding',
	POST_ONBOARDING_1ST_CLICK: 'post_onboarding_1st_click',
	POST_ONBOARDING_2ND_CLICK: 'post_onboarding_2nd_click',
	POST_ONBOARDING_3RD_CLICK: 'post_onboarding_3rd_click',
	EXIT_BUTTON: 'core_onboarding_exit_button',
	SKIP: 'core_onboarding_skip',
	TOP_UPGRADE: 'core_onboarding_top_upgrade',
	CREATE_MY_ACCOUNT: 'core_onboarding_s1_create_my_account',
	CREATE_ACCOUNT_STATUS: 'core_onboarding_create_account_status',
	STEP1_CLICKED_CONNECT: 'core_onboarding_s1_clicked_connect',
};

export const ONBOARDING_STEP_NAMES = {
	CONNECT: 'connect',
	HELLO_BIZ: 'hello_biz',
	PRO_FEATURES: 'pro_features',
	SITE_STARTER: 'site_starter',
	SITE_NAME: 'site_name',
	SITE_LOGO: 'site_logo',
	ONBOARDING_START: 'onboarding_start',
};

export function canSendEvents() {
	return elementorCommon?.config?.editor_events?.can_send_events || false;
}

export function isEventsManagerAvailable() {
	return elementorCommon?.eventsManager &&
		'function' === typeof elementorCommon.eventsManager.dispatchEvent;
}

export function dispatch( eventName, payload = {} ) {
	if ( ! isEventsManagerAvailable() ) {
		return false;
	}

	if ( ! canSendEvents() ) {
		return false;
	}

	try {
		const result = elementorCommon.eventsManager.dispatchEvent( eventName, payload );
		return result;
	} catch ( error ) {
		return false;
	}
}

export function dispatchIfAllowed( eventName, payload = {} ) {
	if ( canSendEvents() ) {
		return dispatch( eventName, payload );
	}
	return false;
}

export function createEventPayload( basePayload = {} ) {
	return {
		location: 'plugin_onboarding',
		trigger: 'user_action',
		...basePayload,
	};
}

export function createStepEventPayload( stepNumber, stepName, additionalData = {} ) {
	return createEventPayload( {
		step_number: stepNumber,
		step_name: stepName,
		...additionalData,
	} );
}

export function createEditorEventPayload( additionalData = {} ) {
	return {
		location: 'editor',
		trigger: 'elementor_loaded',
		...additionalData,
	};
}

export function dispatchStepEvent( eventName, stepNumber, stepName, additionalData = {} ) {
	const payload = createStepEventPayload( stepNumber, stepName, additionalData );
	return dispatch( eventName, payload );
}

export function dispatchEditorEvent( eventName, additionalData = {} ) {
	const payload = createEditorEventPayload( additionalData );
	return dispatch( eventName, payload );
}

export function getClickEventName( clickCount ) {
	const eventMap = {
		1: ONBOARDING_EVENTS_MAP.POST_ONBOARDING_1ST_CLICK,
		2: ONBOARDING_EVENTS_MAP.POST_ONBOARDING_2ND_CLICK,
		3: ONBOARDING_EVENTS_MAP.POST_ONBOARDING_3RD_CLICK,
	};

	return eventMap[ clickCount ] || null;
}

export function dispatchClickEvent( clickCount, clickData, siteStarterChoice = null ) {
	const eventName = getClickEventName( clickCount );
	if ( ! eventName ) {
		return false;
	}

	const clickNumber = getClickNumber( clickCount );
	const eventData = createEditorEventPayload( {
		editor_loaded_from_onboarding_source: siteStarterChoice,
	} );

	eventData[ `post_onboarding_${ clickNumber }_click_action_title` ] = clickData.title;
	eventData[ `post_onboarding_${ clickNumber }_click_action_selector` ] = clickData.selector;

	return dispatch( eventName, eventData );
}

export function getClickNumber( clickCount ) {
	const clickNumbers = { 1: 'first', 2: 'second', 3: 'third' };
	return clickNumbers[ clickCount ] || 'unknown';
}

export function addTimeSpentToPayload( payload, totalTimeSpent, stepTimeSpent = null ) {
	if ( totalTimeSpent !== null && totalTimeSpent !== undefined ) {
		payload.time_spent = `${ totalTimeSpent }s`;
	}

	if ( stepTimeSpent !== null && stepTimeSpent !== undefined ) {
		payload.step_time_spent = `${ stepTimeSpent }s`;
	}

	return payload;
}

const EventDispatcher = {
	canSendEvents,
	isEventsManagerAvailable,
	dispatch,
	dispatchIfAllowed,
	createEventPayload,
	createStepEventPayload,
	createEditorEventPayload,
	dispatchStepEvent,
	dispatchEditorEvent,
	getClickEventName,
	dispatchClickEvent,
	getClickNumber,
	addTimeSpentToPayload,
};

export default EventDispatcher;
