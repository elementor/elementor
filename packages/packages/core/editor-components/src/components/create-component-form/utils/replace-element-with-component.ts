import { replaceElement, type V1Element } from '@elementor/editor-elements';

type ComponentInstanceParams = {
	id?: number;
	name: string;
	uid: string;
};

export const replaceElementWithComponent = ( element: V1Element, component: ComponentInstanceParams ) => {
	replaceElement( {
		currentElement: element,
		newElement: createComponentModel( component ),
		withHistory: false,
	} );
};

export const createComponentModel = ( component: ComponentInstanceParams ) => {
	return {
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component: {
				$$type: 'component-id',
				value: component.id ?? component.uid,
			},
		},
		editor_settings: {
			title: component.name,
			component_uid: component.uid,
		},
	};
};
