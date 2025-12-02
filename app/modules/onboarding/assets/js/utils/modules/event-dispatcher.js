
export const ONBOARDING_EVENTS_MAP = {
	UPGRADE_NOW_S3: 'core_onboarding_s3_upgrade_now',
	THEME_INSTALLED: 'core_onboarding_s2_theme_installed',
	THEME_MARKED: 'core_onboarding_s2_theme_marked',
	CORE_ONBOARDING: 'core_onboarding',
	CONNECT_STATUS: 'core_onboarding_connect_status',
	STEP1_END_STATE: 'core_onboarding_s1_end_state',
	STEP2_END_STATE: 'core_onboarding_s2_end_state',
	STEP2_THEMES_LOADED: 'core_onboarding_s2_themes_loaded',
	STEP3_END_STATE: 'core_onboarding_s3_end_state',
	STEP4_END_STATE: 'core_onboarding_s4_end_state',
	STEP4_LOADED: 'core_onboarding_s4_loaded',
	STEP4_SITE_STARTER: 'core_onboarding_s4_site_starter',
	STEP4_RETURN_STEP4: 'core_onboarding_s4_return',
	EDITOR_LOADED_FROM_ONBOARDING: 'editor_loaded_from_onboarding',
	POST_ONBOARDING_1ST_CLICK: 'post_onboarding_1st_click',
	POST_ONBOARDING_2ND_CLICK: 'post_onboarding_2nd_click',
	POST_ONBOARDING_3RD_CLICK: 'post_onboarding_3rd_click',
	EXIT: 'core_onboarding_exit',
	SKIP: 'core_onboarding_skip',
	TOP_UPGRADE: 'core_onboarding_top_upgrade',
	CREATE_MY_ACCOUNT: 'core_onboarding_s1_create_my_account',
	CREATE_ACCOUNT_STATUS: 'core_onboarding_create_account_status',
	STEP1_CLICKED_CONNECT: 'core_onboarding_s1_clicked_connect',
	AB_101_START_AS_FREE_USER: 'ab_101_start_as_free_user',
	SESSION_REPLAY_START: 'onboarding_session_replay_start',
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
		...basePayload,
	};
}

export function createStepEventPayload( stepNumber, stepName, additionalData = {} ) {
	const basePayload = {
		step_number: stepNumber,
		step_name: stepName,
		...additionalData,
	};

	return createEventPayload( basePayload );
}

export function createEditorEventPayload( additionalData = {} ) {
	const basePayload = {
		location: 'editor',
		...additionalData,
	};

	return basePayload;
}

export function dispatchStepEvent( eventName, stepNumber, stepName, additionalData = {} ) {
	const payload = createStepEventPayload( stepNumber, stepName, additionalData );
	return dispatch( eventName, payload );
}

export function dispatchVariantAwareEvent( eventName, payload ) {
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

export function formatClickAction( title, selector ) {
	if ( ! title && ! selector ) {
		return '';
	}

	if ( ! title ) {
		return selector;
	}

	if ( ! selector ) {
		return title;
	}

	return `${ title } / ${ selector }`;
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

	const formattedAction = formatClickAction( clickData.title, clickData.selector );
	eventData[ `post_onboarding_${ clickNumber }_click_action` ] = formattedAction;

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
	dispatchVariantAwareEvent,
	dispatchEditorEvent,
	getClickEventName,
	dispatchClickEvent,
	getClickNumber,
	addTimeSpentToPayload,
};

export default EventDispatcher;
