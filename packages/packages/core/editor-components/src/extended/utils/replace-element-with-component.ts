import { replaceElement, type V1ElementData } from '@elementor/editor-elements';

import { type ComponentInstanceParams, createComponentModel } from './create-component-model';

export const replaceElementWithComponent = ( element: V1ElementData, component: ComponentInstanceParams ) => {
	return replaceElement( {
		currentElementId: element.id,
		newElement: createComponentModel( component ),
		withHistory: false,
	} );
};
