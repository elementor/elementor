import { injectIntoTop } from '@elementor/editor';

import { ElementsPanelTab } from './components/elements-panel-tab';

export function init() {
	injectIntoTop( {
		id: 'editor-elements-panel-tab',
		component: ElementsPanelTab,
	} );
}
