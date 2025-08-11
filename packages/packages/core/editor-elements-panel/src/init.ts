import { injectIntoTop } from '@elementor/editor';

import { TabPanel } from './components/tab-panel';

export function init() {
	injectIntoTop( {
		id: 'editor-elements-panel-tab',
		component: TabPanel,
	} );
}
