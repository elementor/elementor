import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../store';

export function resetSanitizedComponents() {
	dispatch( slice.actions.resetSanitizedComponents() );
}
