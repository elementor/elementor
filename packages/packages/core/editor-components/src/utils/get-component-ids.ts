import { type V1ElementData } from '@elementor/editor-elements';

import { type ComponentInstancePropValue } from '../types';
import { getComponentDocumentData } from './component-document-data';
import { isComponentInstance } from './is-component-instance';

export const getComponentIds = async ( elements: V1ElementData[] ) => {
	const components = elements.map( async ( { widgetType, elType, elements: childElements, settings } ) => {
		const ids: number[] = [];

		const isComponent = isComponentInstance( { widgetType, elType } );

		if ( isComponent ) {
			const componentId = ( settings?.component_instance as ComponentInstancePropValue< number > )?.value
				?.component_id.value;

			const document = await getComponentDocumentData( componentId );

			childElements = document?.elements;

			if ( Boolean( componentId ) ) {
				ids.push( componentId );
			}
		}

		if ( !! childElements?.length ) {
			ids.push( ...( await getComponentIds( childElements ) ) );
		}

		return ids;
	} );

	const result = ( await Promise.all( components ) ).flat();

	return Array.from( new Set( result ) );
};
