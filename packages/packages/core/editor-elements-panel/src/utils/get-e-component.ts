import { createError } from '@elementor/utils';

import { E_COMPONENT_NAME } from '../consts';
import { getWindow } from './get-window';

const ComponentNotFoundError = createError< { componentId: string } >( {
	code: 'e_component_not_found',
	message: 'Elementor component not found',
} );

export function getEComponent() {
	const eComponent = getWindow().$e.components.get( E_COMPONENT_NAME );

	if ( ! eComponent ) {
		throw new ComponentNotFoundError( { context: { componentId: E_COMPONENT_NAME } } );
	}

	return eComponent;
}
