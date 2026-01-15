import { __dispatch as dispatch } from '@elementor/store';

import { type OperationResult } from '../api';
import { slice } from '../store/store';

export function handleRenamedComponents( result: OperationResult ): void {
	if ( result.failed.length === 0 ) {
		dispatch( slice.actions.cleanUpdatedComponentNames() );
	}
}
