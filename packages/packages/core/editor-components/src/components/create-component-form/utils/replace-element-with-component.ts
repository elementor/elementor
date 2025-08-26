import { replaceElement, type V1Element } from '@elementor/editor-elements';

export const replaceElementWithComponent = async ( element: V1Element, componentId: number ) => {
	replaceElement( {
		currentElement: element,
		newElement: {
			elType: 'widget',
			widgetType: 'e-component',
			settings: {
				component_id: {
					$$type: 'number',
					value: componentId,
				},
			},
		},
		withHistory: false,
	} );
};
