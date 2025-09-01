import { injectIntoTop } from '@elementor/editor';

import { GlobalDialog } from './components/global-dialog';

export function init() {
	injectIntoTop( {
		id: 'global-dialog',
		component: GlobalDialog,
	} );
}
