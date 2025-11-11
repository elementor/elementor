import { replaceElement, type V1ElementData } from '@elementor/editor-elements';

type ComponentInstanceParams = {
	id?: number;
	name: string;
	uuid: string;
};
export const replaceElementWithComponent = ( element: V1ElementData, component: ComponentInstanceParams ) => {
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
				value: component.id ?? component.uuid,
			},
		},
		editor_settings: {
			title: component.name,
			component_uuid: component.uuid,
		},
	};
};
