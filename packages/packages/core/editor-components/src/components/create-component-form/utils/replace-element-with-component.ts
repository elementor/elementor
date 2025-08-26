import { replaceElement, type V1Element } from '@elementor/editor-elements';
import { numberPropTypeUtil } from '@elementor/editor-props';

export const replaceElementWithComponent = async ( element: V1Element, componentId: number ) => {
	replaceElement( {
		currentElement: element,
		newElement: {
			elType: 'widget',
			widgetType: 'e-component',
			settings: {
				component_id: numberPropTypeUtil.create( componentId ),
			},
		},
		withHistory: false,
	} );
};
