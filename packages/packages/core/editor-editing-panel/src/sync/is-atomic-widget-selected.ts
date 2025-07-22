import { getSelectedElements, getWidgetsCache } from '@elementor/editor-elements';

export const isAtomicWidgetSelected = () => {
	const selectedElements = getSelectedElements();
	const widgetCache = getWidgetsCache();

	if ( selectedElements.length !== 1 ) {
		return false;
	}

	// Check if the selected element has atomic controls, meaning it's a V2 element.
	return !! widgetCache?.[ selectedElements[ 0 ].type ]?.atomic_controls;
};
