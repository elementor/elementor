import { __dispatch as dispatch } from '@elementor/store';

import { type SanitizeAttributes, slice } from '../../../store/store';
import { type ComponentId } from '../../../types';

export function updateComponentSanitizedAttribute( componentId: ComponentId, attribute: SanitizeAttributes ) {
	dispatch( slice.actions.updateComponentSanitizedAttribute( { componentId, attribute } ) );
}
