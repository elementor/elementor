import { replaceElement, type V1ElementData, type V1ElementModelProps } from '@elementor/editor-elements';

import { type OverridableProps } from '../../../types';

type ComponentInstanceParams = {
	id?: number;
	name: string;
	uid: string;
	overridableProps?: OverridableProps;
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
					component_id: {
						$$type: 'number',
						value: component.id ?? component.uid,
					},
				},
			},
			overridable_props: component.overridableProps,
		},
		editor_settings: {
			title: '$$UNSET$$',
			component_src_name: component.name,
			component_uid: component.uid,
		},
	};
};
