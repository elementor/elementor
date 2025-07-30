import { injectIntoTop } from '@elementor/editor';
import { __registerSlice as registerSlice } from '@elementor/store';

import { GlobalDialog } from './components/global-dialog';
import { globalDialogSlice } from './slice';

export function init() {
	registerSlice( globalDialogSlice );
	injectIntoTop( {
		id: 'global-dialog',
		component: GlobalDialog,
	} );
}
