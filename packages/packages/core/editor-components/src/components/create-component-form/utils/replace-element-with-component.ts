import { replaceElement, type V1Element } from '@elementor/editor-elements';
import { numberPropTypeUtil } from '@elementor/editor-props';

import { type Component } from '../../../types';

export const replaceElementWithComponent = async ( element: V1Element, component: Component ) => {
	replaceElement( {
		currentElement: element,
		newElement: createComponentModel( component ),
		withHistory: false,
	} );
};

export const createComponentModel = ( component: Component ) => {
	return {
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component_id: numberPropTypeUtil.create( component.id ),
		},
		editor_settings: {
			title: component.name,
		},
	};
};
