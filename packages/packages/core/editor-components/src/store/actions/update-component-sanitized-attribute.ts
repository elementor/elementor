import { __dispatch as dispatch } from '@elementor/store';

import { type ComponentId } from '../../types';
import { type SanitizeAttributes, slice } from '../store';

export function updateComponentSanitizedAttribute( componentId: ComponentId, attribute: SanitizeAttributes ) {
	dispatch( slice.actions.updateComponentSanitizedAttribute( { componentId, attribute } ) );
}
