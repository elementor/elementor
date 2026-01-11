import { type V1Document } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';

import { COMPONENT_WIDGET_TYPE } from '../create-component-type';

export function hasComponentInstances( document: V1Document ): boolean {
	const elements = document?.config?.elements as V1ElementData[] | undefined;

	if ( ! Array.isArray( elements ) ) {
		return false;
	}

	return hasComponentInstancesRecursive( elements );
}

function hasComponentInstancesRecursive( elements: V1ElementData[] ): boolean {
	for ( const element of elements ) {
		if ( element.widgetType === COMPONENT_WIDGET_TYPE ) {
			return true;
		}

		if ( Array.isArray( element.elements ) && hasComponentInstancesRecursive( element.elements ) ) {
			return true;
		}
	}

	return false;
}
