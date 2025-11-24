import { type V1ElementData } from '@elementor/editor-elements';
import { isTransformable } from '@elementor/editor-props';
import { ComponentInstancePropValue } from '../types';

export const getComponentIds = ( elements: V1ElementData[] ) => {
	const result = elements.flatMap( ( element ) => {
		const ids: number[] = [];

		const type = element.widgetType || element.elType;

		if ( type === 'e-component' ) {
			const componentId = (
				element.settings?.component_instance as ComponentInstancePropValue< number >
		 )?.value.component_id.value;

		 if ( componentId ) {
 			ids.push( componentId );
		 }
		}

		if ( element.elements ) {
			ids.push( ...getComponentIds( element.elements ) );
		}

		return ids;
	} );

	return Array.from( new Set( result ) );
};
