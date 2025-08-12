import { replaceElement, type V1Element } from '@elementor/editor-elements';

import { apiClient, type ComponentCreateResponse } from '../api';

export const saveElementAsComponent = async (
	element: V1Element,
	componentName: string,
	options?: {
		onSuccess?: ( result: ComponentCreateResponse ) => void;
		onError?: ( error: unknown ) => void;
	}
) => {
	try {
		const result = await apiClient.create( {
			name: componentName.trim(),
			content: [ element.model.toJSON( { remove: [ 'default' ] } ) ],
		} );

		replaceElement( {
			currentElement: element,
			newElement: {
				elType: 'widget',
				widgetType: 'e-component',
				settings: {
					component_id: {
						$$type: 'number',
						value: result.data.component_id,
					},
				},
			},
			withHistory: false,
		} );

		options?.onSuccess?.( result.data );
	} catch ( error ) {
		console.error( error );
		options?.onError?.( error );
	}
};
