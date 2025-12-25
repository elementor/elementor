import { type V1ElementData } from '@elementor/editor-elements';

import { TYPE } from '../create-component-type';
import { type ComponentInstanceProp } from '../prop-types/component-instance-prop-type';
import { getComponentDocumentData } from './component-document-data';

export const getComponentIds = async ( elements: V1ElementData[] ): Promise< number[] > => {
	const components = elements.map( async ( { widgetType, elType, elements: childElements, settings } ) => {
		const ids: number[] = [];

		const isComponent = [ widgetType, elType ].includes( TYPE );

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

			ids.push( ...( newIds.filter( Boolean ) as number[] ) );
		}

		return ids;
	} );

	const result = ( await Promise.all( components ) ).flat();

	return Array.from( new Set( result ) ).filter( Boolean ) as number[];
};
