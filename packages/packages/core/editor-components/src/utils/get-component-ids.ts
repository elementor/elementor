import { type V1ElementData } from '@elementor/editor-elements';

import { type ComponentInstanceProp } from '../prop-types/component-instance-prop-type';
import { getComponentDocumentData } from './component-document-data';
import { isComponentInstance } from './is-component-instance';

export const getComponentIds = async ( elements: V1ElementData[] ): Promise< number[] > => {
	const components = elements.map( async ( { widgetType, elType, elements: childElements, settings } ) => {
		const ids: number[] = [];

		const isComponent = isComponentInstance( { widgetType, elType } );

		if ( isComponent ) {
			const componentId = ( settings?.component_instance as ComponentInstanceProp )?.value?.component_id.value;

			if ( ! componentId ) {
				return;
			}

			const document = await getComponentDocumentData( componentId );

			childElements = document?.elements;

			if ( Boolean( componentId ) ) {
				ids.push( componentId );
			}
		}

		if ( !! childElements?.length ) {
			const newIds = await getComponentIds( childElements );

			ids.push( ...Array.from( new Set( newIds ) ) );
		}

		return ids;
	} );

	const result = ( await Promise.all( components ) ).flat();

	return Array.from( new Set( result ) ).filter( ( value ) => value !== undefined );
};
