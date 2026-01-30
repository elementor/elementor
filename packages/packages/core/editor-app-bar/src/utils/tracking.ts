import { type ExtendedWindow } from '../types';

function getEventsManager() {
	const extendedWindow = window as unknown as ExtendedWindow;
	return extendedWindow?.elementorCommon?.eventsManager;
}

export function trackPublishDropdownAction( targetName: string ) {
	const eventsManager = getEventsManager();
	const config = eventsManager?.config;

	if ( ! eventsManager?.dispatchEvent || ! config ) {
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
