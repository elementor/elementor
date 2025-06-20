import { type Element } from '../types';
import { type ExtendedWindow } from './types';

export function getSelectedElements(): Element[] {
	const extendedWindow = window as unknown as ExtendedWindow;

	const selectedElements = extendedWindow.elementor?.selection?.getElements?.() ?? [];

	return selectedElements.reduce< Element[] >( ( acc, el ) => {
		const type = el.model.get( 'widgetType' ) || el.model.get( 'elType' );

		if ( type ) {
			acc.push( {
				id: el.model.get( 'id' ),
				type,
			} );
		}

		return acc;
	}, [] );
}
