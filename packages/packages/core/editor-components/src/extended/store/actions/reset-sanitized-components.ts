import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../../../store/store';

export function resetSanitizedComponents() {
	dispatch( slice.actions.resetSanitizedComponents() );
}
