import { type ExtendedWindow } from '../types';

function getExtendedWindow() {
	return window as unknown as ExtendedWindow;
}

function getEventsManager() {
	return getExtendedWindow()?.elementorCommon?.eventsManager;
}

function canSendEvents() {
	return getExtendedWindow()?.elementorCommon?.config?.editor_events?.can_send_events || false;
}

function isEventsManagerAvailable() {
	const eventsManager = getEventsManager();
	return eventsManager && 'function' === typeof eventsManager.dispatchEvent;
}

export function trackPublishDropdownAction( targetName: string ) {
	if ( ! isEventsManagerAvailable() || ! canSendEvents() ) {
		return;
	}

	const eventsManager = getEventsManager();
	const config = eventsManager?.config;

	if ( ! config ) {
		return;
	}

	eventsManager.dispatchEvent( config.names.editorOne.topBarPublishDropdown, {
		app_type: config.appTypes.editor,
		window_name: config.appTypes.editor,
		interaction_type: config.triggers.click,
		target_type: config.targetTypes.dropdownItem,
		target_name: targetName,
		interaction_result: config.interactionResults.actionSelected,
		target_location: config.locations.topBar,
		location_l1: config.secondaryLocations.publishDropdown,
		location_l2: config.targetTypes.dropdownItem,
		interaction_description: 'User selected an action from the publish dropdown',
	} );
}
