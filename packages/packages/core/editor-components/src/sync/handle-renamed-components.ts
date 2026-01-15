import { __dispatch as dispatch } from '@elementor/store';

import { slice } from '../store/store';

type OperationResult = {
	successIds: number[];
	failed: Array< { id: number; error: string } >;
};

export function handleRenamedComponents( result: OperationResult ): void {
	if ( result.failed.length === 0 ) {
		dispatch( slice.actions.cleanUpdatedComponentNames() );
	}
}
