import { injectIntoTop } from '@elementor/editor';

import { KitSettingsTab } from './components/kit-settings-tab';

export function init() {
	injectIntoTop( {
		id: 'editor-kit-settings-tab',
		component: KitSettingsTab,
	} );
}
