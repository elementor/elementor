import { __dispatch as dispatch } from '@elementor/store';

import { type ComponentId } from '../../types';
import { slice } from '../store';

export function addSanitizedComponent( componentId: ComponentId ) {
	dispatch( slice.actions.addSanitizeComponent( componentId ) );
}
