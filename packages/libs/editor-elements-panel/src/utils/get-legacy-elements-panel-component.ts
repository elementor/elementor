import { createError } from '@elementor/utils';

import { LEGACY_ELEMENTS_PANEL_COMPONENT_NAME } from '../consts';
import { getWindow } from './get-window';

const ComponentNotFoundError = createError< { componentId: string } >( {
	code: 'e_component_not_found',
	message: 'Elementor component not found',
} );

export function getLegacyElementsPanelComponent() {
	const eComponent = getWindow().$e.components.get( LEGACY_ELEMENTS_PANEL_COMPONENT_NAME );

	if ( ! eComponent ) {
		throw new ComponentNotFoundError( { context: { componentId: LEGACY_ELEMENTS_PANEL_COMPONENT_NAME } } );
	}

	return eComponent;
}
