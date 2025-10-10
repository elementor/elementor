import StorageManager, { ONBOARDING_STORAGE_KEYS } from './storage-manager.js';

export const ONBOARDING_EVENTS_MAP = {
	UPGRADE_NOW_S3: 'core_onboarding_s3_upgrade_now',
	HELLO_BIZ_CONTINUE: 'core_onboarding_s2_hellobiz',
	THEME_CHOICE: 'core_onboarding_theme_choice',
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
	AB_101_START_AS_FREE_USER: 'ab_101_start_as_free_user',
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
	const canSend = elementorCommon?.config?.editor_events?.can_send_events || false;
	console.log( '[EventDispatcher] canSendEvents check:', {
		canSend,
		editorEventsConfig: elementorCommon?.config?.editor_events,
	} );
	return canSend;
}

export function isEventsManagerAvailable() {
	return elementorCommon?.eventsManager &&
		'function' === typeof elementorCommon.eventsManager.dispatchEvent;
}

export function dispatch( eventName, payload = {} ) {
	console.log( `[EventDispatcher] dispatch called - event: ${eventName}`, payload );
	
	if ( ! isEventsManagerAvailable() ) {
		console.warn( '[EventDispatcher] Events manager not available' );
		return false;
	}

	if ( ! canSendEvents() ) {
		console.warn( '[EventDispatcher] Cannot send events (disabled)' );
		return false;
	}

	try {
		console.log( `[EventDispatcher] Dispatching event: ${eventName}` );
		const result = elementorCommon.eventsManager.dispatchEvent( eventName, payload );
		console.log( `[EventDispatcher] Event dispatched successfully: ${eventName}, result:`, result );
		return result;
	} catch ( error ) {
		console.error( `[EventDispatcher] Failed to dispatch event: ${eventName}`, error );
		return false;
	}
}

export function dispatchIfAllowed( eventName, payload = {} ) {
	if ( canSendEvents() ) {
		return dispatch( eventName, payload );
	}
	return false;
}

function getExperimentConfigs() {
	return {
		101: {
			variantKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT101_VARIANT,
			enabledKey: 'isExperiment101Enabled',
			minStep: 1,
			payloadKey: '101_variant',
		},
		201: {
			variantKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT201_VARIANT,
			enabledKey: 'isExperiment201Enabled',
			minStep: 2,
			payloadKey: '201_variant',
		},
		402: {
			variantKey: ONBOARDING_STORAGE_KEYS.EXPERIMENT402_VARIANT,
			enabledKey: 'isExperiment402Enabled',
			minStep: 4,
			payloadKey: '402_variant',
		},
	};
}

function getExperimentVariant( experimentId ) {
	const config = getExperimentConfigs()[ experimentId ];
	if ( ! config ) {
		console.log( `[Onboarding Debug] getExperimentVariant: No config found for experiment ${experimentId}` );
		return null;
	}
	const variant = StorageManager.getString( config.variantKey ) || null;
	console.log( `[Onboarding Debug] getExperimentVariant: Experiment ${experimentId}, variantKey: ${config.variantKey}, variant: ${variant}` );
	return variant;
}

function isExperimentEnabled( experimentId ) {
	const config = getExperimentConfigs()[ experimentId ];
	if ( ! config ) {
		console.log( `[Onboarding Debug] isExperimentEnabled: No config found for experiment ${experimentId}` );
		return false;
	}
	const isEnabled = elementorAppConfig?.onboarding?.[ config.enabledKey ] || false;
	console.log( `[Onboarding Debug] isExperimentEnabled: Experiment ${experimentId}, enabledKey: ${config.enabledKey}, isEnabled: ${isEnabled}` );
	console.log( `[Onboarding Debug] isExperimentEnabled: elementorAppConfig.onboarding:`, elementorAppConfig?.onboarding );
	return isEnabled;
}

export function createEventPayload( basePayload = {} ) {
	return {
		location: 'plugin_onboarding',
		trigger: 'user_action',
		...basePayload,
	};
}

export function createStepEventPayload( stepNumber, stepName, additionalData = {} ) {
	console.log( `[Onboarding Debug] createStepEventPayload: stepNumber: ${stepNumber}, stepName: ${stepName}` );
	
	const basePayload = {
		step_number: stepNumber,
		step_name: stepName,
		...additionalData,
	};

	const experiments = getExperimentConfigs();
	console.log( `[Onboarding Debug] createStepEventPayload: Processing experiments:`, experiments );
	
	Object.keys( experiments ).forEach( ( experimentId ) => {
		const config = experiments[ experimentId ];
		const stepMeetsMinimum = stepNumber >= config.minStep;
		const experimentEnabled = isExperimentEnabled( parseInt( experimentId, 10 ) );
		
		console.log( `[Onboarding Debug] createStepEventPayload: Experiment ${experimentId} - stepNumber: ${stepNumber}, minStep: ${config.minStep}, stepMeetsMinimum: ${stepMeetsMinimum}, experimentEnabled: ${experimentEnabled}` );
		
		if ( stepMeetsMinimum && experimentEnabled ) {
			const variant = getExperimentVariant( parseInt( experimentId, 10 ) );
			basePayload[ config.payloadKey ] = variant;
			console.log( `[Onboarding Debug] createStepEventPayload: Added ${config.payloadKey}: ${variant} to payload` );
		} else {
			console.log( `[Onboarding Debug] createStepEventPayload: Skipped experiment ${experimentId} - stepMeetsMinimum: ${stepMeetsMinimum}, experimentEnabled: ${experimentEnabled}` );
		}
	} );

	console.log( `[Onboarding Debug] createStepEventPayload: Final basePayload:`, basePayload );
	return createEventPayload( basePayload );
}

export function createEditorEventPayload( additionalData = {} ) {
	const basePayload = {
		location: 'editor',
		trigger: 'elementor_loaded',
		...additionalData,
	};

	const experiments = getExperimentConfigs();
	Object.keys( experiments ).forEach( ( experimentId ) => {
		const config = experiments[ experimentId ];
		const variant = getExperimentVariant( parseInt( experimentId, 10 ) );
		if ( variant ) {
			basePayload[ config.payloadKey ] = variant;
		}
	} );

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
	dispatchVariantAwareEvent,
	dispatchEditorEvent,
	getClickEventName,
	dispatchClickEvent,
	getClickNumber,
	addTimeSpentToPayload,
};

export default EventDispatcher;
