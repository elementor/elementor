import { createError } from '@elementor/utils';

const NAVIGATION_WRAPPER_ID = 'elementor-panel-elements-navigation';

const ElementsPanelWrapperElementNotFoundError = createError( {
	code: 'elements_panel_wrapper_element_not_found',
	message: 'Elementor Elements Panel wrapper element not found',
} );

export function getNavigationWrapperElement() {
	const wrapper = document.getElementById( NAVIGATION_WRAPPER_ID );

	if ( ! wrapper ) {
		throw new ElementsPanelWrapperElementNotFoundError();
	}

	return wrapper;
}
