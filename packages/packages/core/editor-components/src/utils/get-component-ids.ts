import { type V1ElementData } from '@elementor/editor-elements';
import { isTransformable } from '@elementor/editor-props';

export const getComponentIds = ( elements: V1ElementData[] ) => {
	return elements.flatMap( ( element ) => {
		const ids: number[] = [];

		const type = element.widgetType || element.elType;

		if (
			type === 'e-component' &&
			element.settings?.component_id &&
			isTransformable( element.settings?.component_id )
		) {
			ids.push( element.settings.component_id.value );
		}

		if ( element.elements ) {
			ids.push( ...getComponentIds( element.elements ) );
		}

		return ids;
	} );
};
