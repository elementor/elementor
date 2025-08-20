import { type ExtendedWindow, getSelectedElements } from '@elementor/editor-elements';

import { initialTransitionValue } from '../controls/transition-control/data';

export const sendAddTransitionControlEvent = () => {
	const extendedWindow: ExtendedWindow = window;
	const config = extendedWindow.elementorCommon?.eventsManager?.config;
	const eventName = config?.names.elementorEditor?.transitions?.clickAddedTransition;

	const selectedElements = getSelectedElements();
	const widgetType = selectedElements[ 0 ].type ?? null;

	if ( config && eventName && extendedWindow.elementorCommon?.eventsManager ) {
		extendedWindow.elementorCommon.eventsManager.dispatchEvent( eventName, {
			location: config.locations.styleTabV4,
			secondaryLocation: config.secondaryLocations.transitionControl,
			trigger: config.triggers.click,
			transition_type: initialTransitionValue.selection.value.value.value,
			widget_type: widgetType,
		} );
	}
};
