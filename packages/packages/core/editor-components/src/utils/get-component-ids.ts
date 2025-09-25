import { type Element } from '../types';

export const getComponentIds = ( elements: Element[] ) => {
	return elements.flatMap( ( element ) => {
		const ids: number[] = [];

		const type = element.widgetType || element.elType;

		if ( type === 'e-component' && element.settings?.component_id && element.settings?.component_id?.value ) {
			ids.push( element.settings.component_id.value );
		}

		if ( element.elements ) {
			ids.push( ...getComponentIds( element.elements ) );
		}

		return ids;
	} );
};
