import { type V1ElementData } from '@elementor/editor-elements';
import { isTransformable } from '@elementor/editor-props';

export const getComponentIds = ( elements: V1ElementData[] ) => {
	return elements.flatMap( ( element ) => {
		const ids: number[] = [];

		const type = element.widgetType || element.elType;

		if ( type === 'e-component' && element.settings?._children && isTransformable( element.settings?._children ) ) {
			ids.push( element.settings._children.value );
		}

		if ( element.elements ) {
			ids.push( ...getComponentIds( element.elements ) );
		}

		return ids;
	} );
};
