import { injectIntoLogic } from '@elementor/editor';
import { __registerSlice } from '@elementor/store';

import { LogicHooks } from './components/logic-hooks';
import { slice } from './store';
import { syncStore } from './sync';

export function init() {
	initStore();

	injectIntoLogic( {
		id: 'documents-hooks',
		component: LogicHooks,
	} );
}

function initStore() {
	__registerSlice( slice );

	syncStore();
}
