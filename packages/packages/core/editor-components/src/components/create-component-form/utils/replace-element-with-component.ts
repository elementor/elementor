import { replaceElement, type V1Element } from '@elementor/editor-elements';

import { type Component } from '../../../types';

export const replaceElementWithComponent = ( element: V1Element, component: Component ) => {
	replaceElement( {
		currentElement: element,
		newElement: createComponentModel( component ),
		withHistory: false,
	} );
};

export const createComponentModel = (
	component: Component
): Parameters< typeof replaceElement >[ 0 ][ 'newElement' ] => {
	return {
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component: {
				$$type: 'component-id',
				value: component.id,
			},
		},
		editor_settings: {
			title: component.name,
		},
	};
};
