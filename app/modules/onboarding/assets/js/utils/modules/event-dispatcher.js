import {
	clearEventQueue,
	enqueueEvent,
	getEventQueue,
} from './event-queue.js';
import {
	createCoreOnboardingPayload,
	createEditorPayload,
	ONBOARDING_EVENTS,
} from './onboarding-event-names.js';

export const ONBOARDING_EVENTS_MAP = {
	...ONBOARDING_EVENTS,
	SESSION_REPLAY_START: ONBOARDING_EVENTS.SESSION_REPLAY_START,
};

export const ONBOARDING_STEP_NAMES = {
	CONNECT: 'connect',
	HELLO_BIZ: 'hello_theme',
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

function isMixpanelInitialized() {
	const configuredInstance = elementorCommon?.config?.editor_events?.mixpanelInstance;
	if ( configuredInstance?.isInitialized ) {
		return true;
	}

	if ( elementorCommon?.eventsManager?.isMixpanelReady?.() ) {
		return true;
	}

	return false;
}

export function initializeAndEnableTracking() {
	if ( ! isEventsManagerAvailable() ) {
		return;
	}

	if ( ! isMixpanelInitialized() ) {
		try {
			elementorCommon.eventsManager.initializeMixpanel( () => {
				if ( ! elementorCommon.eventsManager.trackingEnabled ) {
					elementorCommon.eventsManager.enableTracking();
				}
			} );
		} catch ( error ) {
			return;
		}
		return;
	}

	if ( ! elementorCommon.eventsManager.trackingEnabled ) {
		elementorCommon.eventsManager.enableTracking();
	}
}

export function dispatch( eventName, payload = {} ) {
	if ( ! isEventsManagerAvailable() ) {
		return false;
	}

	if ( ! canSendEvents() ) {
		return false;
	}

	try {
		return elementorCommon.eventsManager.dispatchEvent( eventName, payload );
	} catch ( error ) {
		return false;
	}
}

export function trackEvent( eventName, payload, dedupeKey = null ) {
	const fullPayload = payload.window_name ? payload : createCoreOnboardingPayload( payload );

	if ( canSendEvents() ) {
		initializeAndEnableTracking();
		return dispatch( eventName, fullPayload );
	}

	enqueueEvent( eventName, fullPayload, dedupeKey );
	return false;
}

export function flushQueue() {
	if ( ! canSendEvents() || ! isEventsManagerAvailable() ) {
		return;
	}

	initializeAndEnableTracking();

	const queued = [ ...getEventQueue() ].sort( ( a, b ) => a.timestamp - b.timestamp );
	const stillPending = [];

	queued.forEach( ( event ) => {
		if ( ! event?.name || ! event?.payload ) {
			return;
		}

		const dispatched = dispatch( event.name, event.payload );
		if ( false === dispatched ) {
			stillPending.push( event );
		}
	} );

	if ( 0 === stillPending.length ) {
		clearEventQueue();
		return;
	}

	try {
		sessionStorage.setItem( 'elementor_core_onboarding_event_queue', JSON.stringify( stillPending ) );
	} catch ( error ) {
		// Storage unavailable.
	}
}

export function dispatchIfAllowed( eventName, payload = {} ) {
	if ( canSendEvents() ) {
		return dispatch( eventName, payload );
	}
	return false;
}

export function dispatchEditorEvent( eventName, additionalData = {} ) {
	const payload = createEditorPayload( additionalData );
	return trackEvent( eventName, payload );
}

export function dispatchPostClickEvent( clickOrder, clickData ) {
	const formattedAction = formatClickAction( clickData.title, clickData.selector );

	return trackEvent( ONBOARDING_EVENTS.POST_CLICK, createEditorPayload( {
		interaction_type: 'click',
		target_type: 'element',
		target_name: 'post_onboarding_click',
		interaction_result: 'click_recorded',
		target_value: String( clickOrder ),
		target_location: 'editor',
		location_l1: 'editor',
		metadata: {
			click_action: formattedAction,
		},
	} ) );
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

const EventDispatcher = {
	canSendEvents,
	isEventsManagerAvailable,
	initializeAndEnableTracking,
	dispatch,
	trackEvent,
	flushQueue,
	dispatchIfAllowed,
	dispatchEditorEvent,
	dispatchPostClickEvent,
	formatClickAction,
	ONBOARDING_EVENTS,
};

export default EventDispatcher;
