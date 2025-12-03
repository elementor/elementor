import { replaceElement, type V1ElementData, type V1ElementModelProps } from '@elementor/editor-elements';

type ComponentInstanceParams = {
	id?: number;
	name: string;
	uid: string;
};

export const replaceElementWithComponent = ( element: V1ElementData, component: ComponentInstanceParams ) => {
	replaceElement( {
		currentElement: element,
		newElement: createComponentModel( component ),
		withHistory: false,
	} );
};

export const createComponentModel = ( component: ComponentInstanceParams ): Omit< V1ElementModelProps, 'id' > => {
	return {
		elType: 'widget',
		widgetType: 'e-component',
		settings: {
			component_instance: {
				$$type: 'component-instance',
				value: {
					component_id: component.id ?? component.uid,
				},
			},
		},
		editor_settings: {
			title: component.name,
			component_uid: component.uid,
		},
	};
};
