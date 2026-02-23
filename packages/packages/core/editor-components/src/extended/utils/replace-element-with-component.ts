import { replaceElement, type V1ElementData } from '@elementor/editor-elements';

import { type ComponentInstanceParams, createComponentModel } from '../../utils/create-component-model';

export const replaceElementWithComponent = async ( element: V1ElementData, component: ComponentInstanceParams ) => {
	return await replaceElement( {
		currentElement: element,
		newElement: createComponentModel( component ),
		withHistory: false,
	} );
};
